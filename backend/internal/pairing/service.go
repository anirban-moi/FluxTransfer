package pairing

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"sync"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/device"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/network/udp"
	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
	pairingprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/pairing"
	"github.com/anirban-moi/FluxTransfer/backend/internal/trusted"
	"go.uber.org/zap"
)

type PairingStatus string

const (
	PairingStatusUnpaired PairingStatus = "unpaired"
	PairingStatusPending  PairingStatus = "pending"
	PairingStatusPaired   PairingStatus = "paired"
	PairingStatusRejected PairingStatus = "rejected"
)

type Service struct {
	logger         *logger.Logger
	device         *models.Device
	deviceService  device.Service
	udp            *udp.Broadcaster
	pending        *PendingRegistry
	sender         *udp.Sender
	trustedService *trusted.Service

	mu             sync.RWMutex
	outgoingStatus map[string]PairingStatus
}

func New(
	log *logger.Logger,
	device *models.Device,
	deviceService device.Service,
	broadcaster *udp.Broadcaster,
	sender *udp.Sender,
	pending *PendingRegistry,
	trustedService *trusted.Service,
) *Service {

	return &Service{
		logger:         log,
		device:         device,
		deviceService:  deviceService,
		udp:            broadcaster,
		pending:        pending,
		sender:         sender,
		trustedService: trustedService,
		outgoingStatus: make(map[string]PairingStatus),
	}
}

func (s *Service) Start(
	ctx context.Context,
) error {

	s.logger.Info(
		"Pairing service started",
	)

	return nil
}

func (s *Service) Shutdown(
	ctx context.Context,
) error {

	s.logger.Info(
		"Pairing service stopped",
	)

	return nil
}

func (s *Service) PairRequest() *models.PairRequest {

	return &models.PairRequest{
		DeviceID:  s.device.ID,
		Name:      s.device.Name,
		Hostname:  s.device.Hostname,
		Platform:  s.device.Platform,
		Version:   s.device.Version,
		PublicKey: "",
	}
}

func (s *Service) HandlePairRequest(
	packet *models.PairRequest,
	addr *net.UDPAddr,
) {
	if packet.DeviceID == s.device.ID {
		return
	}

	replyAddr := &net.UDPAddr{
		IP:   addr.IP,
		Port: 53317,
	}

	s.pending.Add(
		&PendingRequest{
			DeviceID: packet.DeviceID,
			Name:     packet.Name,
			Hostname: packet.Hostname,
			Platform: packet.Platform,
			Address:  replyAddr,
			CreatedAt: time.Now(),
		},
	)

	s.logger.Info(
		"Pair request received",
		zap.String("fromDevice", packet.Name),
		zap.String("fromDeviceID", packet.DeviceID),
		zap.String("fromAddress", addr.String()),
		zap.String("replyAddress", replyAddr.String()),
	)
}

func (s *Service) PendingRequests() []*PendingRequest {
	return s.pending.List()
}

func (s *Service) Pair(
	deviceID string,
) error {
	targetDevice, ok := s.deviceService.Get(deviceID)
	if !ok {
		return fmt.Errorf(
			"device not found: %s",
			deviceID,
		)
	}

	if targetDevice.IPAddress == "" {
		return fmt.Errorf(
			"device %s has no IP address",
			deviceID,
		)
	}

	targetAddr := &net.UDPAddr{
		IP:   net.ParseIP(targetDevice.IPAddress),
		Port: 53317,
	}

	if targetAddr.IP == nil {
		return fmt.Errorf(
			"invalid IP address for device %s: %s",
			deviceID,
			targetDevice.IPAddress,
		)
	}

	s.logger.Info(
		"Sending pair request",
		zap.String("targetDevice", targetDevice.Name),
		zap.String("targetDeviceID", targetDevice.ID),
		zap.String("targetAddress", targetAddr.String()),
	)

	s.mu.Lock()
	s.outgoingStatus[deviceID] = PairingStatusPending
	s.mu.Unlock()

	request := s.PairRequest()

	payload, err := pairingprotocol.EncodeRequest(
		request,
	)
	if err != nil {
		return err
	}

	envelope := &packetprotocol.Envelope{
		Type:    packetprotocol.TypePairRequest,
		Payload: payload,
	}

	data, err := packetprotocol.Encode(
		envelope,
	)
	if err != nil {
		return err
	}

	err = s.sender.Send(
		data,
		targetAddr,
	)
	if err != nil {
		s.logger.Error(
			"Failed to send pair request",
			zap.String("targetAddress", targetAddr.String()),
			zap.Error(err),
		)
		s.mu.Lock()
		delete(s.outgoingStatus, deviceID)
		s.mu.Unlock()
		return err
	}

	return nil
}

func (s *Service) Accept(
	deviceID string,
) error {

	request, ok := s.pending.Get(deviceID)
	if !ok {
		return fmt.Errorf(
			"pending request not found",
		)
	}

	now := time.Now()

	trustedDevice := &models.TrustedDevice{
		DeviceID:  request.DeviceID,
		Name:      request.Name,
		Hostname:  request.Hostname,
		Platform:  request.Platform,
		Version:   "",
		PublicKey: "",
		PairedAt:  now,
		LastSeen:  now,
	}

	if err := s.trustedService.Add(
		trustedDevice,
	); err != nil {
		return fmt.Errorf(
			"failed to save trusted device: %w",
			err,
		)
	}

	s.logger.Info(
		"Pair request accepted locally, notifying sender",
		zap.String("remoteDeviceID", deviceID),
		zap.String("destinationAddress", request.Address.String()),
	)

	if err := s.sendPairResponse(
		request.Address,
		true,
		"",
	); err != nil {
		return fmt.Errorf(
			"failed to send pair response: %w",
			err,
		)
	}

	s.pending.Remove(deviceID)

	s.logger.Info(
		"Pair request accepted and response dispatched",
		zap.String("remoteDeviceID", deviceID),
	)

	return nil
}

func (s *Service) Reject(
	deviceID string,
) error {

	request, ok := s.pending.Get(deviceID)
	if !ok {
		return fmt.Errorf(
			"pending request not found",
		)
	}

	s.logger.Info(
		"Pair request rejected locally, notifying sender",
		zap.String("remoteDeviceID", deviceID),
		zap.String("destinationAddress", request.Address.String()),
	)

	if err := s.sendPairResponse(
		request.Address,
		false,
		"Rejected by user",
	); err != nil {
		return err
	}

	s.pending.Remove(deviceID)

	s.logger.Info(
		"Pair request rejected and response dispatched",
		zap.String("remoteDeviceID", deviceID),
	)

	return nil
}

func (s *Service) sendPairResponse(
	addr *net.UDPAddr,
	accepted bool,
	reason string,
) error {

	s.logger.Info(
		"Sending pair response packet",
		zap.String("destinationAddress", addr.String()),
		zap.Bool("accepted", accepted),
		zap.String("reason", reason),
	)

	packet := &models.PairResponse{
		Version:  1,
		DeviceID: s.device.ID,
		Accepted: accepted,
		Reason:   reason,
	}

	payload, err := pairingprotocol.EncodeResponse(packet)
	if err != nil {
		s.logger.Error(
			"Failed to encode pair response payload",
			zap.Error(err),
		)
		return err
	}

	envelope := &packetprotocol.Envelope{
		Type:    packetprotocol.TypePairResponse,
		Payload: payload,
	}

	data, err := packetprotocol.Encode(envelope)
	if err != nil {
		s.logger.Error(
			"Failed to encode pair response envelope",
			zap.Error(err),
		)
		return err
	}

	err = s.sender.Send(
		data,
		addr,
	)
	if err != nil {
		s.logger.Error(
			"Failed to send pair response via UDP",
			zap.String("destinationAddress", addr.String()),
			zap.Error(err),
		)
		return err
	}

	s.logger.Info(
		"Pair response UDP packet sent successfully",
		zap.String("destinationAddress", addr.String()),
	)

	return nil
}

func (s *Service) HandlePairResponse(
	response *models.PairResponse,
	addr *net.UDPAddr,
) {
	s.logger.Info(
		"Pair response received",
		zap.String("fromAddress", addr.String()),
		zap.String("fromDeviceID", response.DeviceID),
		zap.Bool("accepted", response.Accepted),
		zap.String("reason", response.Reason),
	)

	s.mu.Lock()
	if response.Accepted {
		s.outgoingStatus[response.DeviceID] = PairingStatusPaired
	} else {
		s.outgoingStatus[response.DeviceID] = PairingStatusRejected
	}
	s.mu.Unlock()

	if !response.Accepted {
		s.logger.Info(
			"Pair request rejected by remote device",
			zap.String("remoteDeviceID", response.DeviceID),
		)
		return
	}

	device, ok := s.deviceService.Get(
		response.DeviceID,
	)

	if !ok {
		s.logger.Error(
			"Paired device not found in registry",
			zap.String("remoteDeviceID", response.DeviceID),
		)
		return
	}

	now := time.Now()

	trustedDevice := &models.TrustedDevice{
		DeviceID:  device.ID,
		Name:      device.Name,
		Hostname:  device.Hostname,
		Platform:  device.Platform,
		Version:   device.Version,
		PublicKey: "",
		PairedAt:  now,
		LastSeen:  now,
	}

	if err := s.trustedService.Add(
		trustedDevice,
	); err != nil {
		s.logger.Error(
			"Failed to save trusted device",
			zap.Error(err),
		)
		return
	}

	s.logger.Info(
		"Trusted device added",
		zap.String("deviceName", device.Name),
		zap.String("deviceID", device.ID),
	)
}

func (s *Service) GetDevicePairingState(deviceID string) (bool, string) {
	if _, ok := s.trustedService.Get(deviceID); ok {
		return true, string(PairingStatusPaired)
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	if st, ok := s.outgoingStatus[deviceID]; ok {
		return false, string(st)
	}

	return false, string(PairingStatusUnpaired)
}

func (s *Service) Unpair(deviceID string) error {
	s.logger.Info(
		"Unpairing device locally",
		zap.String("targetDeviceID", deviceID),
	)

	// Remove from trusted repository
	if err := s.trustedService.Remove(deviceID); err != nil {
		s.logger.Error(
			"Failed to remove device from trusted store",
			zap.String("deviceID", deviceID),
			zap.Error(err),
		)
		return err
	}

	s.mu.Lock()
	delete(s.outgoingStatus, deviceID)
	s.mu.Unlock()

	// Notify remote peer via UDP if registered with valid IP
	if targetDevice, ok := s.deviceService.Get(deviceID); ok && targetDevice.IPAddress != "" {
		payload, err := json.Marshal(map[string]string{
			"deviceId": s.device.ID,
		})
		if err == nil {
			envelope := &packetprotocol.Envelope{
				Type:    packetprotocol.TypeUnpair,
				Payload: payload,
			}
			data, err := packetprotocol.Encode(envelope)
			if err == nil {
				targetAddr := &net.UDPAddr{
					IP:   net.ParseIP(targetDevice.IPAddress),
					Port: 53317,
				}
				_ = s.sender.Send(data, targetAddr)
				s.logger.Info(
					"Unpair notification sent to peer",
					zap.String("targetAddress", targetAddr.String()),
				)
			}
		}
	}

	s.logger.Info(
		"Device unpaired successfully",
		zap.String("deviceID", deviceID),
	)

	return nil
}

func (s *Service) HandleUnpair(deviceID string) {
	s.logger.Info(
		"Remote unpair notification received",
		zap.String("fromDeviceID", deviceID),
	)

	_ = s.trustedService.Remove(deviceID)

	s.mu.Lock()
	delete(s.outgoingStatus, deviceID)
	s.mu.Unlock()

	s.logger.Info(
		"Peer removed from trusted devices",
		zap.String("deviceID", deviceID),
	)
}
