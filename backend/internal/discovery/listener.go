package discovery

import (
	"context"
	"errors"
	"fmt"
	"net"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	discoveryprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/discovery"

	"go.uber.org/zap"
)

type Listener struct {
	logger  *logger.Logger
	config  Config
	handler PacketHandler
}

func NewListener(
	cfg Config,
	log *logger.Logger,
	handler PacketHandler,
) *Listener {

	return &Listener{
		logger:  log,
		config:  cfg,
		handler: handler,
	}
}

func (l *Listener) Start(
	ctx context.Context,
) error {

	address := fmt.Sprintf(
		"127.0.0.1:%d",
		l.config.BroadcastPort,
	)

	udpAddr, err := net.ResolveUDPAddr(
		"udp4",
		address,
	)
	if err != nil {
		return fmt.Errorf("failed to resolve UDP address: %w", err)
	}

	conn, err := net.ListenUDP(
		"udp4",
		udpAddr,
	)
	if err != nil {
		return fmt.Errorf("failed to start UDP listener: %w", err)
	}

	defer conn.Close()

	l.logger.Info("Discovery listener started")

	buffer := make([]byte, 4096)

	for {

		// Allow graceful shutdown by waking up once per second.
		if err := conn.SetReadDeadline(
			time.Now().Add(time.Second),
		); err != nil {
			return fmt.Errorf("failed to set read deadline: %w", err)
		}

		select {

		case <-ctx.Done():

			l.logger.Info(
				"Discovery listener stopped",
			)

			return nil

		default:

			n, addr, err := conn.ReadFromUDP(buffer)
			if err != nil {

				// Timeout is expected so we can periodically
				// check for context cancellation.
				var netErr net.Error
				if errors.As(err, &netErr) && netErr.Timeout() {
					continue
				}

				l.logger.Error(
					"Failed to receive discovery packet",
					zap.Error(err),
				)

				continue
			}

			packet, err := discoveryprotocol.Decode(
				buffer[:n],
			)
			if err != nil {

				l.logger.Error(
					"Failed to decode discovery packet",
					zap.Error(err),
				)

				continue
			}

			l.handler.HandlePacket(
				packet,
				addr,
			)
		}
	}
}
