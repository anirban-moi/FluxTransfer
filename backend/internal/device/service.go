package device

import (
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/registry"
)

type deviceService struct {
	registry registry.Registry
}

func New(
	reg registry.Registry,
) Service {

	return &deviceService{
		registry: reg,
	}
}

func (s *deviceService) Register(
	device *models.Device,
) {
	device.LastSeen = time.Now()
	device.Status = models.StatusOnline
	s.registry.Add(device)
}

func (s *deviceService) Update(
	device *models.Device,
) {
	device.LastSeen = time.Now()
	s.registry.Update(device)
}

func (s *deviceService) Refresh(
	device *models.Device,
) {
	device.LastSeen = time.Now()
	device.Status = models.StatusOnline
	s.registry.Update(device)
}

func (s *deviceService) MarkOffline(
	id string,
) {
	s.registry.MarkOffline(id)
}

func (s *deviceService) Get(
	id string,
) (*models.Device, bool) {
	return s.registry.Get(id)
}

func (s *deviceService) List() []*models.Device {
	return s.registry.List()
}
