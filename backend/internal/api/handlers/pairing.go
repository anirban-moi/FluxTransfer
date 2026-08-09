package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/anirban-moi/FluxTransfer/backend/internal/pairing"
)

type PairingHandler struct {
	service *pairing.Service
}

func NewPairingHandler(
	service *pairing.Service,
) *PairingHandler {

	return &PairingHandler{
		service: service,
	}
}

type PairDeviceRequest struct {
	DeviceID string `json:"deviceId"`
}

func (h *PairingHandler) Pair(
	w http.ResponseWriter,
	r *http.Request,
) {

	var req PairDeviceRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {

		JSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": err.Error(),
			},
		)

		return
	}

	if err := h.service.Pair(req.DeviceID); err != nil {

		JSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": err.Error(),
			},
		)

		return
	}

	w.WriteHeader(
		http.StatusAccepted,
	)
}
