package registry

import (
	"sync"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type DeviceRegistry struct {
	mu sync.RWMutex

	devices map[string]*models.Device
}

func New() *DeviceRegistry {
	return &DeviceRegistry{
		devices: make(map[string]*models.Device),
	}
}
