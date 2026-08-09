package handlers

import (
	"net/http"

	"github.com/anirban-moi/FluxTransfer/backend/internal/pairing"
)

type PairingsHandler struct {
	service *pairing.Service
}

func NewPairingsHandler(
	service *pairing.Service,
) *PairingsHandler {

	return &PairingsHandler{
		service: service,
	}
}

func (h *PairingsHandler) Pending(
	w http.ResponseWriter,
	r *http.Request,
) {

	JSON(
		w,
		http.StatusOK,
		h.service.PendingRequests(),
	)

}
