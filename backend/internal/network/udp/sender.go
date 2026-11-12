package udp

import (
	"net"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"go.uber.org/zap"
)

type Sender struct {
	logger *logger.Logger
}

func NewSender(
	log *logger.Logger,
) *Sender {

	return &Sender{
		logger: log,
	}

}

func (s *Sender) Send(
	data []byte,
	addr *net.UDPAddr,
) error {

	conn, err := net.DialUDP(
		"udp4",
		nil,
		addr,
	)
	if err != nil {
		s.logger.Error(
			"UDP Dial failed",
			zap.String("destinationAddress", addr.String()),
			zap.Error(err),
		)
		return err
	}

	defer conn.Close()

	n, err := conn.Write(data)
	if err != nil {
		s.logger.Error(
			"UDP Send failed",
			zap.String("destinationAddress", addr.String()),
			zap.Error(err),
		)
		return err
	}

	s.logger.Debug(
		"UDP packet sent",
		zap.String("destinationAddress", addr.String()),
		zap.Int("bytes", n),
	)

	return nil
}
