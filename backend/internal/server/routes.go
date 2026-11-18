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
		s.pairing,
	)

	deviceInfoHandler := handlers.NewDeviceInfoHandler(
		s.device,
	)

	pairingHandler := handlers.NewPairingHandler(
		s.pairing,
	)

	pairingsHandler := handlers.NewPairingsHandler(
		s.pairing,
	)

	transferHandler := handlers.NewTransferHandler(
		s.transfer,
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
		"POST /api/pairings/accept",
		pairingsHandler.Accept,
	)

	mux.HandleFunc(
		"POST /api/pairings/reject",
		pairingsHandler.Reject,
	)

	mux.HandleFunc(
		"POST /api/pairings/unpair",
		pairingsHandler.Unpair,
	)

	mux.HandleFunc(
		"GET /api/pairings/pending",
		pairingsHandler.Pending,
	)

	mux.HandleFunc(
		"POST /api/transfers/send",
		transferHandler.Send,
	)

	mux.HandleFunc(
		"GET /api/transfers",
		transferHandler.List,
	)

	mux.HandleFunc(
		"GET /api/transfers/pending",
		transferHandler.Pending,
	)

	mux.HandleFunc(
		"POST /api/transfers/accept",
		transferHandler.Accept,
	)

	mux.HandleFunc(
		"POST /api/transfers/reject",
		transferHandler.Reject,
	)

	mux.HandleFunc(
		"POST /api/transfers/cancel",
		transferHandler.Cancel,
	)

	mux.HandleFunc(
		"/health",
		s.healthHandler,
	)
}
