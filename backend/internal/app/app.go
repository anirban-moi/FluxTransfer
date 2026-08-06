package app

import (
	"github.com/anirban-moi/FluxTransfer/backend/internal/config"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/server"
)

type Application struct {
	cfg *config.Config

	logger *logger.Logger

	server *server.Server
}

func New(cfg *config.Config) (*Application, error) {

	logCfg := logger.Config{
		Level: cfg.Logging.Level,
	}

	appLogger, err := logger.New(logCfg)
	if err != nil {
		return nil, err
	}

	httpServer := server.New(
		cfg,
		appLogger,
	)

	return &Application{
		cfg: cfg,

		logger: appLogger,

		server: httpServer,
	}, nil
}
