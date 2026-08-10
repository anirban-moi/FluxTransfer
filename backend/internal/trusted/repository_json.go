package trusted

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type JSONRepository struct {
	mu       sync.RWMutex
	filePath string
	devices  map[string]*models.TrustedDevice
}

func NewJSONRepository(
	filePath string,
) (*JSONRepository, error) {

	repository := &JSONRepository{
		filePath: filePath,
		devices:  make(map[string]*models.TrustedDevice),
	}

	if err := repository.load(); err != nil {
		return nil, err
	}

	return repository, nil
}

func (r *JSONRepository) Get(
	deviceID string,
) (*models.TrustedDevice, bool) {

	r.mu.RLock()
	defer r.mu.RUnlock()

	device, ok := r.devices[deviceID]

	return device, ok
}

func (r *JSONRepository) List() []*models.TrustedDevice {

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

func (r *JSONRepository) Save(
	device *models.TrustedDevice,
) error {

	r.mu.Lock()
	defer r.mu.Unlock()

	r.devices[device.DeviceID] = device

	return r.persist()
}

func (r *JSONRepository) Remove(
	deviceID string,
) error {

	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.devices, deviceID)

	return r.persist()
}

func (r *JSONRepository) load() error {

	data, err := os.ReadFile(r.filePath)

	if os.IsNotExist(err) {
		return nil
	}

	if err != nil {
		return fmt.Errorf(
			"failed to read trusted devices: %w",
			err,
		)
	}

	if len(data) == 0 {
		return nil
	}

	var devices []*models.TrustedDevice

	if err := json.Unmarshal(
		data,
		&devices,
	); err != nil {

		return fmt.Errorf(
			"failed to decode trusted devices: %w",
			err,
		)
	}

	for _, device := range devices {

		if device == nil {
			continue
		}

		r.devices[device.DeviceID] = device
	}

	return nil
}

func (r *JSONRepository) persist() error {

	devices := make(
		[]*models.TrustedDevice,
		0,
		len(r.devices),
	)

	for _, device := range r.devices {
		devices = append(devices, device)
	}

	data, err := json.MarshalIndent(
		devices,
		"",
		"  ",
	)

	if err != nil {
		return fmt.Errorf(
			"failed to encode trusted devices: %w",
			err,
		)
	}

	if err := os.MkdirAll(
		filepath.Dir(r.filePath),
		0755,
	); err != nil {

		return fmt.Errorf(
			"failed to create trusted devices directory: %w",
			err,
		)
	}

	tempPath := r.filePath + ".tmp"

	if err := os.WriteFile(
		tempPath,
		data,
		0644,
	); err != nil {

		return fmt.Errorf(
			"failed to write trusted devices: %w",
			err,
		)
	}

	if err := os.Rename(
		tempPath,
		r.filePath,
	); err != nil {

		return fmt.Errorf(
			"failed to replace trusted devices file: %w",
			err,
		)
	}

	return nil
}
