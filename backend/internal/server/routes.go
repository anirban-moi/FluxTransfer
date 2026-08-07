package server

import (
	"net/http"

	"github.com/anirban-moi/FluxTransfer/backend/internal/api/handlers"
)

func (s *Server) registerRoutes(
	mux *http.ServeMux,
) {

	deviceHandler := handlers.NewDeviceHandler(
		s.registry,
	)

	deviceInfoHandler := handlers.NewDeviceInfoHandler(
		s.device,
	)

	mux.HandleFunc(
		"GET /api/device",
		deviceInfoHandler.Get,
	)

	mux.HandleFunc(
		"GET /api/devices",
		deviceHandler.List,
	)

	mux.HandleFunc(
		"/health",
		s.healthHandler,
	)
}
