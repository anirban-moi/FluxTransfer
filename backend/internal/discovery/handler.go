package discovery

import (
	"fmt"
	"net"

	discoveryprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/discovery"
	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
)

type Handler struct {
	service *Service
}

func NewHandler(
	service *Service,
) *Handler {

	return &Handler{
		service: service,
	}
}

func (h *Handler) Handle(
	data []byte,
	addr *net.UDPAddr,
) {

	envelope, err := packetprotocol.Decode(data)

	if err != nil {
		fmt.Println("Packet decode error:", err)
		return
	}

	if envelope.Type != packetprotocol.TypeDiscovery {
		fmt.Println("Not a discovery packet")
		return
	}

	packet, err := discoveryprotocol.Decode(
		envelope.Payload,
	)

	if err != nil {
		fmt.Println("Discovery decode failed:", err)
		return
	}

	h.service.HandlePacket(
		packet,
		addr,
	)
}
