package transfer

import (
	"net"

	packetprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/packet"
	transferprotocol "github.com/anirban-moi/FluxTransfer/backend/internal/protocol/transfer"
	"go.uber.org/zap"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Handle(data []byte, addr *net.UDPAddr) {
	envelope, err := packetprotocol.Decode(data)
	if err != nil {
		return
	}

	switch envelope.Type {
	case packetprotocol.TypeTransferRequest:
		h.service.logger.Info(
			"Transfer request UDP datagram arrived",
			zap.String("fromAddress", addr.String()),
		)

		packet, err := transferprotocol.DecodeRequest(envelope.Payload)
		if err != nil {
			h.service.logger.Error(
				"Failed to decode transfer request payload",
				zap.Error(err),
			)
			return
		}

		h.service.HandleTransferRequest(packet, addr)

	case packetprotocol.TypeTransferResponse:
		h.service.logger.Info(
			"Transfer response UDP datagram arrived",
			zap.String("fromAddress", addr.String()),
		)

		packet, err := transferprotocol.DecodeResponse(envelope.Payload)
		if err != nil {
			h.service.logger.Error(
				"Failed to decode transfer response payload",
				zap.Error(err),
			)
			return
		}

		h.service.HandleTransferResponse(packet, addr)

	default:
		return
	}
}
