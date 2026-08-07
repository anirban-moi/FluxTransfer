package discovery

import (
	"context"
	"net"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/registry"

	"go.uber.org/zap"
)

type Service struct {
	logger *logger.Logger

	config Config

	device *models.Device

	registry registry.Registry

	broadcaster *Broadcaster

	listener *Listener
}

func New(
	cfg Config,
	log *logger.Logger,
	device *models.Device,
	reg registry.Registry,
) *Service {

	service := &Service{
		logger:   log,
		config:   cfg,
		device:   device,
		registry: reg,
	}

	service.broadcaster = NewBroadcaster(
		cfg,
		log,
		service,
	)

	service.listener = NewListener(
		cfg,
		log,
		service,
	)

	return service
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

func (s *Service) HandlePacket(
	packet *models.DiscoveryPacket,
	addr *net.UDPAddr,
) {

	// Ignore packets sent by ourselves.
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

	if !s.registry.Add(device) {
		s.registry.Update(device)
	}

	s.logger.Info(
		"Discovery packet received",
		zap.String("device", packet.Name),
		zap.String("address", addr.IP.String()),
	)
}

func (s *Service) Start(
	ctx context.Context,
) error {

	go func() {
		if err := s.listener.Start(ctx); err != nil {
			s.logger.Error(
				"Discovery listener stopped",
				zap.Error(err),
			)
		}
	}()

	go func() {
		if err := s.broadcaster.Start(ctx); err != nil {
			s.logger.Error(
				"Discovery broadcaster stopped",
				zap.Error(err),
			)
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
