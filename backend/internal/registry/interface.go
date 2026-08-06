package registry

import "github.com/anirban-moi/FluxTransfer/backend/internal/models"

type Registry interface {
	Add(device *models.Device)
	Update(device *models.Device) bool
	Remove(id string) bool
	Get(id string) (*models.Device, bool)
	List() []*models.Device
	MarkOffline(id string) bool
}
