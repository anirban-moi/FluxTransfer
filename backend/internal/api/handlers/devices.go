package handlers

import (
	"net/http"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/pairing"
	"github.com/anirban-moi/FluxTransfer/backend/internal/registry"
)

type DeviceHandler struct {
	registry registry.Registry
	pairing  *pairing.Service
}

func NewDeviceHandler(
	reg registry.Registry,
	pairing *pairing.Service,
) *DeviceHandler {

	return &DeviceHandler{
		registry: reg,
		pairing:  pairing,
	}
}

type DeviceResponse struct {
	*models.Device
	IsTrusted     bool   `json:"isTrusted"`
	PairingStatus string `json:"pairingStatus"`
}

func (h *DeviceHandler) List(
	w http.ResponseWriter,
	r *http.Request,
) {

	devices := h.registry.List()
	response := make([]DeviceResponse, 0, len(devices))

	for _, d := range devices {
		isTrusted := false
		status := "unpaired"
		if h.pairing != nil {
			isTrusted, status = h.pairing.GetDevicePairingState(d.ID)
		}

		response = append(response, DeviceResponse{
			Device:        d,
			IsTrusted:     isTrusted,
			PairingStatus: status,
		})
	}

	JSON(
		w,
		http.StatusOK,
		response,
	)
}
