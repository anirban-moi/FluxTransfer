package heartbeat

import (
	"fmt"
	"net"

	heartbeatprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/heartbeat"
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
		fmt.Println("Envelope decode failed:", err)
		return
	}

	if envelope.Type != packetprotocol.TypeHeartbeat {
		return
	}

	packet, err := heartbeatprotocol.Decode(
		envelope.Payload,
	)
	if err != nil {
		return
	}

	h.service.HandleHeartbeat(
		packet,
		addr,
	)
}
