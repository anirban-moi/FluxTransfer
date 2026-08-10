package trusted

import (
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type Repository interface {
	Get(deviceID string) (*models.TrustedDevice, bool)
	List() []*models.TrustedDevice
	Save(device *models.TrustedDevice) error
	Remove(deviceID string) error
}
