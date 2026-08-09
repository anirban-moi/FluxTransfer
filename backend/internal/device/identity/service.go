package identity

import (
	"errors"
	"os"
	"time"
)

type IdentityService struct {
	storage *Storage
}

func NewIdentityService(
	storage *Storage,
) *IdentityService {

	return &IdentityService{
		storage: storage,
	}

}

func (s *IdentityService) Load() (
	*Identity,
	error,
) {

	identity, err := s.storage.Load()
	if err == nil {
		return identity, nil
	}

	if !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}

	identity = &Identity{
		DeviceID:  GenerateDeviceID(),
		CreatedAt: time.Now(),
	}

	if err := s.storage.Save(identity); err != nil {
		return nil, err
	}

	return identity, nil
}
