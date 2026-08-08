package heartbeat

import (
	"context"
	"net"
	"time"

	devicepkg "github.com/anirban-moi/FluxTransfer/backend/internal/device"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	protocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/heartbeat"
	"go.uber.org/zap"
)

type Service struct {
	logger        *logger.Logger
	config        Config
	device        *models.Device
	deviceService devicepkg.Service
	cleaner       *Cleaner
}

func New(
	cfg Config,
	log *logger.Logger,
	localDevice *models.Device,
	deviceService devicepkg.Service,
) *Service {

	service := &Service{
		logger:        log,
		config:        cfg,
		device:        localDevice,
		deviceService: deviceService,
	}

	service.cleaner = NewCleaner(
		cfg,
		deviceService,
	)

	return service
}

func (s *Service) HeartbeatPacket() *protocol.Packet {

	return &protocol.Packet{
		Version:  1,
		DeviceID: s.device.ID,
		UnixTime: time.Now().Unix(),
	}
}

func (s *Service) HandleHeartbeat(
	packet *protocol.Packet,
	addr *net.UDPAddr,
) {

	if packet.DeviceID == s.device.ID {
		return
	}

	device, ok := s.deviceService.Get(
		packet.DeviceID,
	)

	if !ok {
		return
	}

	device.LastSeen = time.Now()

	device.Status = models.StatusOnline

	s.deviceService.Refresh(device)

	s.logger.Debug(
		"Heartbeat received",
		zap.String(
			"device",
			packet.DeviceID,
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
		s.cleaner.Start(ctx)
	}()

	s.logger.Info(
		"Heartbeat service started",
	)

	return nil
}

func (s *Service) Shutdown(
	ctx context.Context,
) error {

	s.logger.Info(
		"Heartbeat service stopped",
	)

	return nil
}
