package transfer

import (
	"testing"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

func TestEncodeDecodeRequest(t *testing.T) {
	req := &models.TransferRequest{
		TransferID: "test-transfer-123",
		SenderID:   "device-a",
		SenderName: "Laptop A",
		TargetID:   "device-b",
		FileName:   "photo.jpg",
		FileSize:   2048,
		TotalFiles: 1,
		Checksum:   "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		Port:       53318,
	}

	data, err := EncodeRequest(req)
	if err != nil {
		t.Fatalf("EncodeRequest failed: %v", err)
	}

	decoded, err := DecodeRequest(data)
	if err != nil {
		t.Fatalf("DecodeRequest failed: %v", err)
	}

	if decoded.TransferID != req.TransferID {
		t.Errorf("Expected TransferID %s, got %s", req.TransferID, decoded.TransferID)
	}
	if decoded.FileName != req.FileName {
		t.Errorf("Expected FileName %s, got %s", req.FileName, decoded.FileName)
	}
	if decoded.FileSize != req.FileSize {
		t.Errorf("Expected FileSize %d, got %d", req.FileSize, decoded.FileSize)
	}
	if decoded.Checksum != req.Checksum {
		t.Errorf("Expected Checksum %s, got %s", req.Checksum, decoded.Checksum)
	}
}

func TestEncodeDecodeResponse(t *testing.T) {
	resp := &models.TransferResponse{
		TransferID: "test-transfer-123",
		ReceiverID: "device-b",
		Accepted:   true,
		Reason:     "",
		Port:       53318,
	}

	data, err := EncodeResponse(resp)
	if err != nil {
		t.Fatalf("EncodeResponse failed: %v", err)
	}

	decoded, err := DecodeResponse(data)
	if err != nil {
		t.Fatalf("DecodeResponse failed: %v", err)
	}

	if decoded.TransferID != resp.TransferID {
		t.Errorf("Expected TransferID %s, got %s", resp.TransferID, decoded.TransferID)
	}
	if decoded.Accepted != resp.Accepted {
		t.Errorf("Expected Accepted %v, got %v", resp.Accepted, decoded.Accepted)
	}
	if decoded.Port != resp.Port {
		t.Errorf("Expected Port %d, got %d", resp.Port, decoded.Port)
	}
}
