package config

import (
	"fmt"

	"github.com/spf13/viper"
)

func Load() (*Config, error) {
	v := viper.New()

	const ConfigDirectory = "./configs"
	const ConfigName = "config"

	v.SetConfigName(ConfigName)
	v.SetConfigType("yaml")
	v.AddConfigPath(ConfigDirectory)

	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read configuration: %w", err)
	}

	cfg := &Config{}

	if err := v.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal configuration: %w", err)
	}

	if err := Validate(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}
