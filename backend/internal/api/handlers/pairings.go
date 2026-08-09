package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/anirban-moi/FluxTransfer/backend/internal/pairing"
)

type PairingsHandler struct {
	service *pairing.Service
}

type PairActionRequest struct {
	DeviceID string `json:"deviceId"`
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

func (h *PairingsHandler) Accept(
	w http.ResponseWriter,
	r *http.Request,
) {

	var request PairActionRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	if err := h.service.Accept(request.DeviceID); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *PairingsHandler) Reject(
	w http.ResponseWriter,
	r *http.Request,
) {

	var request PairActionRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	if err := h.service.Reject(request.DeviceID); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	w.WriteHeader(http.StatusOK)
}
