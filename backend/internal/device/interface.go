package device

import "github.com/anirban-moi/FluxTransfer/backend/internal/models"

type Service interface {
	Register(device *models.Device)

	Update(device *models.Device)

	Refresh(device *models.Device)

	MarkOffline(id string)

	Get(id string) (*models.Device, bool)

	List() []*models.Device
}
