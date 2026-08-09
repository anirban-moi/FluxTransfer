package server

import (
	"net/http"
)

func (s *Server) healthHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.WriteHeader(http.StatusOK)

	_, _ = w.Write(
		[]byte("OK"),
	)
}
