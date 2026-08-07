package handlers

import (
	"net/http"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type DeviceInfoHandler struct {
	device *models.Device
}

func NewDeviceInfoHandler(
	device *models.Device,
) *DeviceInfoHandler {

	return &DeviceInfoHandler{
		device: device,
	}
}

func (h *DeviceInfoHandler) Get(
	w http.ResponseWriter,
	r *http.Request,
) {

	JSON(
		w,
		http.StatusOK,
		h.device,
	)
}
