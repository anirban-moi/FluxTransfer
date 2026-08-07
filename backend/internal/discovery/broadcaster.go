package discovery

import (
	"context"
	"fmt"
	"net"
	"time"

	discoveryprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/discovery"

	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"go.uber.org/zap"
)

type Broadcaster struct {
	logger *logger.Logger

	config Config

	provider DiscoveryPacketProvider
}

func NewBroadcaster(
	cfg Config,
	log *logger.Logger,
	provider DiscoveryPacketProvider,
) *Broadcaster {

	return &Broadcaster{
		logger:   log,
		config:   cfg,
		provider: provider,
	}
}

func (b *Broadcaster) Start(
	ctx context.Context,
) error {

	address := fmt.Sprintf(
		"255.255.255.255:%d",
		b.config.BroadcastPort,
	)

	udpAddr, err := net.ResolveUDPAddr(
		"udp4",
		address,
	)
	if err != nil {
		return err
	}

	conn, err := net.DialUDP(
		"udp4",
		nil,
		udpAddr,
	)
	if err != nil {
		return err
	}

	defer conn.Close()

	ticker := time.NewTicker(
		b.config.BroadcastInterval,
	)

	defer ticker.Stop()

	for {

		select {

		case <-ctx.Done():

			b.logger.Info(
				"Discovery broadcaster stopped",
			)

			return nil

		case <-ticker.C:

			if err := b.broadcast(conn); err != nil {

				b.logger.Error(
					"Failed to broadcast discovery packet",
					zap.Error(err),
				)

			}

		}

	}
}

func (b *Broadcaster) broadcast(
	conn *net.UDPConn,
) error {
	b.logger.Info("Sending discovery packet")
	packet := b.provider.DiscoveryPacket()

	data, err := discoveryprotocol.Encode(packet)
	if err != nil {
		return err
	}

	_, err = conn.Write(data)
	if err != nil {
		return err
	}

	b.logger.Debug(
		"Discovery packet broadcasted",
	)

	return nil
}
