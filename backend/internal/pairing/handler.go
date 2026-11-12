package pairing

import (
	"net"

	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
	pairingprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/pairing"
	"go.uber.org/zap"
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
		h.service.logger.Info(
			"Pair request UDP packet arrived at handler",
			zap.String("fromAddress", addr.String()),
			zap.Int("bytes", len(data)),
		)

		packet, err := pairingprotocol.DecodeRequest(
			envelope.Payload,
		)
		if err != nil {
			h.service.logger.Error(
				"Failed to decode pair request payload",
				zap.String("fromAddress", addr.String()),
				zap.Error(err),
			)
			return
		}

		h.service.HandlePairRequest(
			packet,
			addr,
		)

	case packetprotocol.TypePairResponse:
		h.service.logger.Info(
			"Pair response UDP packet arrived at handler",
			zap.String("fromAddress", addr.String()),
			zap.Int("bytes", len(data)),
		)

		packet, err := pairingprotocol.DecodeResponse(
			envelope.Payload,
		)
		if err != nil {
			h.service.logger.Error(
				"Failed to decode pair response payload",
				zap.String("fromAddress", addr.String()),
				zap.Error(err),
			)
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
