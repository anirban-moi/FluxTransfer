package app

import (
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/config"
	"github.com/anirban-moi/FluxTransfer/backend/internal/discovery"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/registry"
	"github.com/anirban-moi/FluxTransfer/backend/internal/server"
)

type Application struct {
	cfg       *config.Config
	logger    *logger.Logger
	server    *server.Server
	registry  registry.Registry
	discovery *discovery.Service
}

func New(cfg *config.Config) (*Application, error) {

	// Logger
	logCfg := logger.Config{
		Level: cfg.Logging.Level,
	}

	appLogger, err := logger.New(logCfg)
	if err != nil {
		return nil, err
	}

	// Device Registry
	deviceRegistry := registry.New()

	// Local Device
	device := &models.Device{
		ID:       "device-1",
		Name:     cfg.Device.Name,
		Hostname: "localhost",
		Platform: "windows",
		Port:     53318,
		Version:  "0.1.0-dev",
		Status:   models.StatusOnline,
	}

	// HTTP Server
	httpServer := server.New(
		cfg,
		appLogger,
		deviceRegistry,
		device,
	)

	// Discovery Configuration
	discoveryCfg := discovery.Config{
		BroadcastInterval: 5 * time.Second,
		BroadcastPort:     53317,
	}

	// Discovery Service
	discoveryService := discovery.New(
		discoveryCfg,
		appLogger,
		device,
		deviceRegistry,
	)

	return &Application{
		cfg:       cfg,
		logger:    appLogger,
		server:    httpServer,
		registry:  deviceRegistry,
		discovery: discoveryService,
	}, nil
}
