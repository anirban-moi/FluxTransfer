package pairing

import (
	"context"
	"net"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/device"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/network/udp"
	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
	pairingprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/pairing"
)

type Service struct {
	logger        *logger.Logger
	device        *models.Device
	deviceService device.Service
	udp           *udp.Broadcaster
	pending       *PendingRegistry
}

func New(
	log *logger.Logger,
	device *models.Device,
	deviceService device.Service,
	broadcaster *udp.Broadcaster,
	pending *PendingRegistry,
) *Service {

	return &Service{
		logger:        log,
		device:        device,
		deviceService: deviceService,
		udp:           broadcaster,
		pending:       pending,
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

	s.pending.Add(
		&PendingRequest{
			DeviceID:  packet.DeviceID,
			Name:      packet.Name,
			Hostname:  packet.Hostname,
			Platform:  packet.Platform,
			Address:   addr.IP.String(),
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
		Type:    packetprotocol.TypePairing,
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
