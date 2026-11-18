package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/anirban-moi/FluxTransfer/backend/internal/transfer"
)

type TransferHandler struct {
	service *transfer.Service
}

func NewTransferHandler(service *transfer.Service) *TransferHandler {
	return &TransferHandler{
		service: service,
	}
}

type InitiateTransferJSONRequest struct {
	TargetDeviceID string `json:"targetDeviceId"`
	FilePath       string `json:"filePath"`
}

type AcceptTransferRequest struct {
	TransferID string `json:"transferId"`
	SaveDir    string `json:"saveDir"`
}

type ActionTransferRequest struct {
	TransferID string `json:"transferId"`
	Reason     string `json:"reason,omitempty"`
}

func (h *TransferHandler) Send(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")

	// 1. Multipart Form Upload (Browser file picker)
	if strings.HasPrefix(contentType, "multipart/form-data") {
		// Limit to 2GB in-flight streaming
		if err := r.ParseMultipartForm(32 << 20); err != nil {
			http.Error(w, fmt.Sprintf("Failed to parse multipart form: %v", err), http.StatusBadRequest)
			return
		}

		targetDeviceID := r.FormValue("targetDeviceId")
		if targetDeviceID == "" {
			http.Error(w, "targetDeviceId is required", http.StatusBadRequest)
			return
		}

		file, header, err := r.FormFile("file")
		if err != nil {
			http.Error(w, fmt.Sprintf("File field is required: %v", err), http.StatusBadRequest)
			return
		}
		defer file.Close()

		stagingDir := filepath.Join(os.TempDir(), "FluxTransfer", "uploads")
		_ = os.MkdirAll(stagingDir, 0755)

		stagedFilePath := filepath.Join(stagingDir, header.Filename)
		dst, err := os.OpenFile(stagedFilePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to stage upload: %v", err), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, fmt.Sprintf("Failed to write staged file: %v", err), http.StatusInternalServerError)
			return
		}
		_ = dst.Close()

		session, err := h.service.InitiateTransfer(r.Context(), targetDeviceID, stagedFilePath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		JSON(w, http.StatusCreated, session.ToProgress())
		return
	}

	// 2. Direct JSON Path Transfer (Local file path)
	var req InitiateTransferJSONRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.TargetDeviceID == "" || req.FilePath == "" {
		http.Error(w, "targetDeviceId and filePath are required", http.StatusBadRequest)
		return
	}

	session, err := h.service.InitiateTransfer(r.Context(), req.TargetDeviceID, req.FilePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	JSON(w, http.StatusCreated, session.ToProgress())
}

func (h *TransferHandler) List(w http.ResponseWriter, r *http.Request) {
	transfers := h.service.ListTransfers()
	JSON(w, http.StatusOK, transfers)
}

func (h *TransferHandler) Pending(w http.ResponseWriter, r *http.Request) {
	pending := h.service.ListPending()
	JSON(w, http.StatusOK, pending)
}

func (h *TransferHandler) Accept(w http.ResponseWriter, r *http.Request) {
	var req AcceptTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.AcceptTransfer(req.TransferID, req.SaveDir); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *TransferHandler) Reject(w http.ResponseWriter, r *http.Request) {
	var req ActionTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	reason := req.Reason
	if reason == "" {
		reason = "Rejected by user"
	}

	if err := h.service.RejectTransfer(req.TransferID, reason); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *TransferHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	var req ActionTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.CancelTransfer(req.TransferID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
