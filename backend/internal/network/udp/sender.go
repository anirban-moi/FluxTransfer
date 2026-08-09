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
		return err
	}

	defer conn.Close()

	_, err = conn.Write(data)
	if err != nil {

		s.logger.Error(
			"UDP Send failed",
			zap.Error(err),
		)

	}

	return err

}
