package discovery

import (
	"context"
	"net"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/device"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/network/udp"

	discoveryprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/discovery"
	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"

	"go.uber.org/zap"
)

type Service struct {
	logger *logger.Logger

	config Config

	device *models.Device

	deviceService device.Service

	udp *udp.Broadcaster
}

func New(
	cfg Config,
	log *logger.Logger,
	device *models.Device,
	deviceService device.Service,
	udpBroadcaster *udp.Broadcaster,
) *Service {

	return &Service{
		logger: log,

		config: cfg,

		device: device,

		deviceService: deviceService,

		udp: udpBroadcaster,
	}
}

func (s *Service) DiscoveryPacket() *models.DiscoveryPacket {

	return &models.DiscoveryPacket{
		Version:      models.DiscoveryProtocolVersion,
		Type:         models.MessageDiscover,
		DeviceID:     s.device.ID,
		Name:         s.device.Name,
		Hostname:     s.device.Hostname,
		Platform:     s.device.Platform,
		VersionName:  s.device.Version,
		TransferPort: s.device.Port,
	}
}

func (s *Service) broadcast() error {

	s.logger.Info(
		"Sending discovery broadcast",
		zap.String("device", s.device.Name),
	)

	discoveryPacket := s.DiscoveryPacket()

	payload, err := discoveryprotocol.Encode(
		discoveryPacket,
	)
	if err != nil {
		return err
	}

	envelope := &packetprotocol.Envelope{
		Type:    packetprotocol.TypeDiscovery,
		Payload: payload,
	}

	data, err := packetprotocol.Encode(
		envelope,
	)
	if err != nil {
		return err
	}

	s.logger.Debug(
		"Broadcasting discovery packet",
	)

	return s.udp.Send(data)
}

func (s *Service) HandlePacket(
	packet *models.DiscoveryPacket,
	addr *net.UDPAddr,
) {

	if packet.DeviceID == s.device.ID {
		return
	}

	device := &models.Device{
		ID:        packet.DeviceID,
		Name:      packet.Name,
		Hostname:  packet.Hostname,
		Platform:  packet.Platform,
		IPAddress: addr.IP.String(),
		Port:      packet.TransferPort,
		Version:   packet.VersionName,
		Status:    models.StatusOnline,
		LastSeen:  time.Now(),
	}

	_, exists := s.deviceService.Get(
		device.ID,
	)

	if exists {
		s.deviceService.Refresh(device)
	} else {
		s.deviceService.Register(device)
	}

	s.logger.Info(
		"Discovery packet received",
		zap.String(
			"device",
			packet.Name,
		),
		zap.String(
			"address",
			addr.IP.String(),
		),
	)
}

func (s *Service) Start(
	ctx context.Context,
) error {

	go func() {

		ticker := time.NewTicker(
			s.config.BroadcastInterval,
		)
		defer ticker.Stop()

		for {

			select {
			case <-ctx.Done():
				return

			case <-ticker.C:
				if err := s.broadcast(); err != nil {
					s.logger.Error(
						"Discovery broadcast failed",
						zap.Error(err),
					)
				}
			}
		}
	}()

	s.logger.Info(
		"Discovery service started",
	)

	return nil
}

func (s *Service) Shutdown(
	ctx context.Context,
) error {

	s.logger.Info(
		"Discovery service stopped",
	)

	return nil
}
