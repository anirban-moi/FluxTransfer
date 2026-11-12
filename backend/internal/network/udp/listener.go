package udp

import (
	"context"
	"net"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"go.uber.org/zap"
)

type Listener struct {
	logger  *logger.Logger
	conn    *net.UDPConn
	handler Handler
}

func NewListener(
	log *logger.Logger,
	conn *net.UDPConn,
	handler Handler,
) *Listener {

	return &Listener{
		logger:  log,
		conn:    conn,
		handler: handler,
	}
}

func (l *Listener) Listen(
	ctx context.Context,
) error {

	buffer := make([]byte, 4096)

	for {

		select {

		case <-ctx.Done():
			return nil

		default:

			if err := l.conn.SetReadDeadline(
				time.Now().Add(time.Second),
			); err != nil {
				return err
			}

			n, addr, err := l.conn.ReadFromUDP(buffer)

			if err != nil {

				// Timeout so we can check ctx.Done()
				if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
					continue
				}

				return err
			}

			if l.logger != nil {
				l.logger.Debug(
					"UDP packet read from socket",
					zap.String("fromAddress", addr.String()),
					zap.Int("bytes", n),
				)
			}

			l.handler.Handle(
				buffer[:n],
				addr,
			)
		}
	}
}
