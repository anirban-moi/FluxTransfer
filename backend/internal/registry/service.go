package registry

import (
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

func (r *DeviceRegistry) Add(device *models.Device) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.devices[device.ID]; exists {
		return false
	}

	r.devices[device.ID] = device

	return true
}

func (r *DeviceRegistry) Update(
	device *models.Device,
) bool {

	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.devices[device.ID]; !ok {
		return false
	}

	r.devices[device.ID] = device

	return true
}

func (r *DeviceRegistry) Remove(id string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.devices[id]; !ok {
		return false
	}

	delete(r.devices, id)

	return true
}

func (r *DeviceRegistry) Get(
	id string,
) (*models.Device, bool) {

	r.mu.RLock()
	defer r.mu.RUnlock()

	device, ok := r.devices[id]

	return device, ok
}

func (r *DeviceRegistry) List() []*models.Device {

	r.mu.RLock()
	defer r.mu.RUnlock()

	devices := make(
		[]*models.Device,
		0,
		len(r.devices),
	)

	for _, device := range r.devices {
		devices = append(
			devices,
			device,
		)
	}

	return devices
}

func (r *DeviceRegistry) MarkOffline(id string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	device, ok := r.devices[id]
	if !ok {
		return false
	}

	device.Status = models.StatusOffline

	return true
}
