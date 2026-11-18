package transfer

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"testing"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

func TestSessionProgressAndChecksum(t *testing.T) {
	ctx := context.Background()
	testData := []byte("FluxTransfer Phase 7 High-Performance Streaming Test")
	hasher := sha256.New()
	hasher.Write(testData)
	expectedHash := hex.EncodeToString(hasher.Sum(nil))

	session := NewSession(
		ctx,
		"transfer-uuid-1",
		models.TransferDirectionIncoming,
		"test.txt",
		int64(len(testData)),
		expectedHash,
		"device-sender",
		"Sender Laptop",
	)

	session.WriteToHasher(testData)
	calculated := session.CalculatedChecksum()
	if calculated != expectedHash {
		t.Fatalf("Checksum mismatch: expected %s, got %s", expectedHash, calculated)
	}

	session.UpdateProgress(int64(len(testData)))
	progress := session.ToProgress()
	if progress.Percentage != 100 {
		t.Errorf("Expected 100%% percentage, got %f", progress.Percentage)
	}
	if progress.TransferredBytes != int64(len(testData)) {
		t.Errorf("Expected %d transferred bytes, got %d", len(testData), progress.TransferredBytes)
	}
}
