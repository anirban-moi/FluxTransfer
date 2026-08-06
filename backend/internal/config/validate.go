package config

import "fmt"

func Validate(cfg *Config) error {

	if cfg.Server.Port <= 0 {
		return fmt.Errorf("server.port must be greater than zero")
	}

	if cfg.Discovery.Port <= 0 {
		return fmt.Errorf("discovery.port must be greater than zero")
	}

	if cfg.Transfer.ChunkSize <= 0 {
		return fmt.Errorf("transfer.chunkSize must be greater than zero")
	}

	if cfg.Transfer.Timeout <= 0 {
		return fmt.Errorf("transfer.timeout must be greater than zero")
	}

	if cfg.Device.Name == "" {
		return fmt.Errorf("device.name cannot be empty")
	}

	return nil
}
