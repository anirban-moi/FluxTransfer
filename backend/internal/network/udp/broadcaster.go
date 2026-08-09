package udp

import (
	"net"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"go.uber.org/zap"
)

type Broadcaster struct {
	logger *logger.Logger

	conn *net.UDPConn
}

func NewBroadcaster(
	log *logger.Logger,
	conn *net.UDPConn,
) *Broadcaster {

	return &Broadcaster{
		logger: log,
		conn:   conn,
	}
}

// Broadcsat
func (b *Broadcaster) Send(
	data []byte,
) error {

	_, err := b.conn.Write(data)

	if err != nil {
		b.logger.Error(
			"UDP Send failed",
			zap.Error(err),
		)
	}

	return err
}

// Unicast
func (b *Broadcaster) SendTo(
	data []byte,
	addr *net.UDPAddr,
) error {

	_, err := b.conn.WriteToUDP(
		data,
		addr,
	)

	if err != nil {

		b.logger.Error(
			"UDP SendTo failed",
			zap.Error(err),
		)

	}

	return err
}

func (b *Broadcaster) Close() error {

	if b.conn == nil {
		return nil
	}

	return b.conn.Close()
}
