package udp

import (
	"context"
	"net"
	"time"
)

type Listener struct {
	conn *net.UDPConn

	handler Handler
}

func NewListener(
	conn *net.UDPConn,
	handler Handler,
) *Listener {

	return &Listener{
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

			l.handler.Handle(
				buffer[:n],
				addr,
			)
		}
	}
}
