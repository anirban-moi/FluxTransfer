package heartbeat

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	protocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/heartbeat"

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
		53317,
	)

	udpAddr, err := net.ResolveUDPAddr(
		"udp4",
		address,
	)
	if err != nil {
		return err
	}

	conn, err := net.ListenUDP(
		"udp4",
		udpAddr,
	)
	if err != nil {
		return err
	}

	defer conn.Close()

	l.logger.Info(
		"Heartbeat listener started",
	)

	buffer := make([]byte, 2048)

	for {

		select {

		case <-ctx.Done():

			l.logger.Info(
				"Heartbeat listener stopped",
			)

			return nil

		default:

			conn.SetReadDeadline(
				time.Now().Add(time.Second),
			)

			n, addr, err := conn.ReadFromUDP(buffer)

			if err != nil {
				continue
			}

			packet, err := protocol.Decode(
				buffer[:n],
			)

			if err != nil {

				l.logger.Error(
					"Failed to decode heartbeat",
					zap.Error(err),
				)

				continue
			}

			l.handler.HandleHeartbeat(
				packet,
				addr,
			)
		}
	}
}
