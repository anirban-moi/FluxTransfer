package identity

import (
	"encoding/json"
	"os"
	"path/filepath"
)

const identityFileName = "identity.json"

type Storage struct {
	path string
}

func NewStorage(configDir string) *Storage {
	return &Storage{
		path: filepath.Join(
			configDir,
			identityFileName,
		),
	}
}

func (s *Storage) Save(
	identity *Identity,
) error {

	data, err := json.MarshalIndent(
		identity,
		"",
		"  ",
	)
	if err != nil {
		return err
	}

	// Create the directory if it doesn't exist.
	if err := os.MkdirAll(
		filepath.Dir(s.path),
		0755,
	); err != nil {
		return err
	}

	return os.WriteFile(
		s.path,
		data,
		0644,
	)
}

func (s *Storage) Load() (
	*Identity,
	error,
) {

	data, err := os.ReadFile(
		s.path,
	)
	if err != nil {
		return nil, err
	}

	var identity Identity

	if err := json.Unmarshal(
		data,
		&identity,
	); err != nil {
		return nil, err
	}

	return &identity, nil
}
