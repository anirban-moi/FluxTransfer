package pairing

import (
	"net"

	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
	pairingprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/pairing"
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
		return
	}

	switch envelope.Type {

	case packetprotocol.TypePairRequest:

		packet, err := pairingprotocol.DecodeRequest(
			envelope.Payload,
		)
		if err != nil {
			return
		}

		h.service.HandlePairRequest(
			packet,
			addr,
		)

	case packetprotocol.TypePairResponse:

		packet, err := pairingprotocol.DecodeResponse(
			envelope.Payload,
		)
		if err != nil {
			return
		}

		h.service.HandlePairResponse(
			packet,
			addr,
		)

	default:
		return
	}
}
