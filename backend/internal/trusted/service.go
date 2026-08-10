package trusted

import (
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type Service struct {
	repository Repository
}

func NewService(
	repository Repository,
) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) Add(
	device *models.TrustedDevice,
) error {

	if device.PairedAt.IsZero() {
		device.PairedAt = time.Now()
	}

	if device.LastSeen.IsZero() {
		device.LastSeen = time.Now()
	}

	return s.repository.Save(device)
}

func (s *Service) Get(
	deviceID string,
) (*models.TrustedDevice, bool) {

	return s.repository.Get(deviceID)
}

func (s *Service) List() []*models.TrustedDevice {

	return s.repository.List()
}

func (s *Service) Remove(
	deviceID string,
) error {

	return s.repository.Remove(deviceID)
}

func (s *Service) UpdateLastSeen(
	deviceID string,
) error {

	device, ok := s.repository.Get(deviceID)

	if !ok {
		return nil
	}

	device.LastSeen = time.Now()

	return s.repository.Save(device)
}
