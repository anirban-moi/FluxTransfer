package server

import "net/http"

func (s *Server) registerRoutes(
	mux *http.ServeMux,
) {

	mux.HandleFunc(
		"/health",
		s.healthHandler,
	)
}
