package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/config"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/pairing"
	"github.com/anirban-moi/FluxTransfer/backend/internal/registry"
)

type Server struct {
	cfg        *config.Config
	logger     *logger.Logger
	registry   registry.Registry
	device     *models.Device
	httpServer *http.Server
	pairing    *pairing.Service
}

func New(
	cfg *config.Config,
	log *logger.Logger,
	reg registry.Registry,
	device *models.Device,
) *Server {

	return &Server{
		cfg:        cfg,
		logger:     log,
		registry:   reg,
		device:     device,
		httpServer: nil,
	}
}

func (s *Server) Start() error {

	mux := http.NewServeMux()

	s.registerRoutes(mux)

	s.httpServer = &http.Server{
		Addr: fmt.Sprintf(
			"%s:%d",
			s.cfg.Server.Host,
			s.cfg.Server.Port,
		),
		Handler:      s.cors(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	s.logger.Info("HTTP server starting")

	if err := s.httpServer.ListenAndServe(); err != nil &&
		err != http.ErrServerClosed {
		return err
	}

	return nil
}

func (s *Server) Shutdown(
	ctx context.Context,
) error {

	s.logger.Info("HTTP server shutting down")

	return s.httpServer.Shutdown(ctx)
}
