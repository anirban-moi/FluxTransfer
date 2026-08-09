package appdata

import (
	"os"
	"path/filepath"
)

const applicationName = "FluxTransfer"

func Directory() (string, error) {

	base, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	path := filepath.Join(
		base,
		applicationName,
	)

	if err := os.MkdirAll(
		path,
		0755,
	); err != nil {
		return "", err
	}

	return path, nil
}
