package discovery

import (
	"net"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type DiscoveryPacketProvider interface {
	DiscoveryPacket() *models.DiscoveryPacket
}

type PacketHandler interface {
	HandlePacket(
		packet *models.DiscoveryPacket,
		addr *net.UDPAddr,
	)
}
