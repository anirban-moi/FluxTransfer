package pairing

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/device"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/network/udp"
	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
	pairingprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/pairing"
	"github.com/anirban-moi/FluxTransfer/backend/internal/trusted"
)

type Service struct {
	logger         *logger.Logger
	device         *models.Device
	deviceService  device.Service
	udp            *udp.Broadcaster
	pending        *PendingRegistry
	sender         *udp.Sender
	trustedService *trusted.Service
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

	s.pending.Add(
		&PendingRequest{
			DeviceID: packet.DeviceID,
			Name:     packet.Name,
			Hostname: packet.Hostname,
			Platform: packet.Platform,
			Address: &net.UDPAddr{
				IP:   addr.IP,
				Port: 53317,
			},
			CreatedAt: time.Now(),
		},
	)

	s.logger.Info(
		"Pair request received",
	)

}

func (s *Service) PendingRequests() []*PendingRequest {
	return s.pending.List()
}

func (s *Service) Pair(
	deviceID string,
) error {

	s.logger.Info(
		"Sending pair request",
	)

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

	return s.udp.Send(data)
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
		"Pair request accepted",
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

	if err := s.sendPairResponse(
		request.Address,
		false,
		"Rejected by user",
	); err != nil {
		return err
	}

	s.pending.Remove(deviceID)

	s.logger.Info(
		"Pair request rejected",
	)

	return nil
}

func (s *Service) sendPairResponse(
	addr *net.UDPAddr,
	accepted bool,
	reason string,
) error {

	packet := &models.PairResponse{
		Version:  1,
		DeviceID: s.device.ID,
		Accepted: accepted,
		Reason:   reason,
	}

	payload, err := pairingprotocol.EncodeResponse(packet)
	if err != nil {
		return err
	}

	envelope := &packetprotocol.Envelope{
		Type:    packetprotocol.TypePairResponse,
		Payload: payload,
	}

	data, err := packetprotocol.Encode(envelope)
	if err != nil {
		return err
	}

	return s.sender.Send(
		data,
		addr,
	)
}

// func (s *Service) HandlePairResponse(
// 	packet *models.PairResponse,
// 	addr *net.UDPAddr,
// ) {

// 	if packet.Accepted {

// 		s.logger.Info(
// 			"Pair request accepted",
// 		)

// 	} else {

// 		s.logger.Info(
// 			"Pair request rejected",
// 		)

// 	}

// }

func (s *Service) HandlePairResponse(
	response *models.PairResponse,
	addr *net.UDPAddr,
) {
	if !response.Accepted {
		s.logger.Info(
			"Pair request rejected",
		)

		return
	}

	device, ok := s.deviceService.Get(
		response.DeviceID,
	)

	if !ok {
		s.logger.Error(
			"Paired device not found in registry",
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
		)

		return
	}

	s.logger.Info(
		"Trusted device added",
	)
}
