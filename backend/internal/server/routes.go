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

	pairingHandler := handlers.NewPairingHandler(
		s.pairing,
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
		"POST /api/pairings",
		pairingHandler.Pair,
	)

	mux.HandleFunc(
		"/health",
		s.healthHandler,
	)
}
