package trusted

import (
	"sync"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type MemoryRepository struct {
	mu      sync.RWMutex
	devices map[string]*models.TrustedDevice
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		devices: make(map[string]*models.TrustedDevice),
	}
}

func (r *MemoryRepository) Get(
	deviceID string,
) (*models.TrustedDevice, bool) {

	r.mu.RLock()
	defer r.mu.RUnlock()

	device, ok := r.devices[deviceID]

	return device, ok
}

func (r *MemoryRepository) List() []*models.TrustedDevice {

	r.mu.RLock()
	defer r.mu.RUnlock()

	devices := make(
		[]*models.TrustedDevice,
		0,
		len(r.devices),
	)

	for _, device := range r.devices {
		devices = append(devices, device)
	}

	return devices
}

func (r *MemoryRepository) Save(
	device *models.TrustedDevice,
) error {

	r.mu.Lock()
	defer r.mu.Unlock()

	r.devices[device.DeviceID] = device

	return nil
}

func (r *MemoryRepository) Remove(
	deviceID string,
) error {

	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.devices, deviceID)

	return nil
}
