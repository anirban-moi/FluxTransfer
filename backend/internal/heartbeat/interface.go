package heartbeat

import (
	"net"

	protocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/heartbeat"
)

type PacketProvider interface {
	HeartbeatPacket() *protocol.Packet
}

type PacketHandler interface {
	HandleHeartbeat(
		packet *protocol.Packet,
		addr *net.UDPAddr,
	)
}
