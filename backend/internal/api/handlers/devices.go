package handlers

import (
	"net/http"

	"github.com/anirban-moi/FluxTransfer/backend/internal/registry"
)

type DeviceHandler struct {
	registry registry.Registry
}

func NewDeviceHandler(
	reg registry.Registry,
) *DeviceHandler {

	return &DeviceHandler{
		registry: reg,
	}
}

func (h *DeviceHandler) List(
	w http.ResponseWriter,
	r *http.Request,
) {

	devices := h.registry.List()

	JSON(
		w,
		http.StatusOK,
		devices,
	)
}
