package transfer

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"hash"
	"sync"
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
)

type Session struct {
	mu sync.RWMutex

	TransferID       string
	Direction        models.TransferDirection
	Status           models.TransferStatus
	FileName         string
	FilePath         string // Local source path (outgoing)
	SavePath         string // Destination directory or file (incoming)
	FileSize         int64
	TransferredBytes int64
	Checksum         string // Expected SHA-256
	RemoteDeviceID   string
	RemoteDeviceName string
	RemoteAddress    string
	RemotePort       int

	Speed            int64 // Bytes per second
	RemainingSeconds int64
	ErrorMessage     string

	CreatedAt time.Time
	UpdatedAt time.Time

	hasher hash.Hash

	ctx    context.Context
	cancel context.CancelFunc

	// Speed calculation metrics
	lastBytes int64
	lastTime  time.Time
}

func NewSession(
	parentCtx context.Context,
	transferID string,
	direction models.TransferDirection,
	fileName string,
	fileSize int64,
	checksum string,
	remoteDeviceID string,
	remoteDeviceName string,
) *Session {
	ctx, cancel := context.WithCancel(parentCtx)
	now := time.Now()

	return &Session{
		TransferID:       transferID,
		Direction:        direction,
		Status:           models.TransferStatusPending,
		FileName:         fileName,
		FileSize:         fileSize,
		Checksum:         checksum,
		RemoteDeviceID:   remoteDeviceID,
		RemoteDeviceName: remoteDeviceName,
		CreatedAt:        now,
		UpdatedAt:        now,
		hasher:           sha256.New(),
		ctx:              ctx,
		cancel:           cancel,
		lastTime:         now,
	}
}

func (s *Session) Context() context.Context {
	return s.ctx
}

func (s *Session) Cancel() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.Status = models.TransferStatusCancelled
	s.UpdatedAt = time.Now()
	if s.cancel != nil {
		s.cancel()
	}
}

func (s *Session) SetStatus(status models.TransferStatus) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.Status = status
	s.UpdatedAt = time.Now()
}

func (s *Session) SetError(err error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.Status = models.TransferStatusFailed
	if err != nil {
		s.ErrorMessage = err.Error()
	}
	s.UpdatedAt = time.Now()
	if s.cancel != nil {
		s.cancel()
	}
}

func (s *Session) UpdateProgress(newTransferredBytes int64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	s.TransferredBytes = newTransferredBytes
	s.UpdatedAt = now

	// Calculate speed over elapsed duration
	elapsed := now.Sub(s.lastTime).Seconds()
	if elapsed >= 0.5 {
		deltaBytes := s.TransferredBytes - s.lastBytes
		if deltaBytes > 0 {
			s.Speed = int64(float64(deltaBytes) / elapsed)
			remainingBytes := s.FileSize - s.TransferredBytes
			if s.Speed > 0 && remainingBytes > 0 {
				s.RemainingSeconds = remainingBytes / s.Speed
			} else {
				s.RemainingSeconds = 0
			}
		}
		s.lastBytes = s.TransferredBytes
		s.lastTime = now
	}
}

func (s *Session) WriteToHasher(data []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.hasher != nil {
		s.hasher.Write(data)
	}
}

func (s *Session) CalculatedChecksum() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.hasher == nil {
		return ""
	}
	return hex.EncodeToString(s.hasher.Sum(nil))
}

func (s *Session) ToProgress() *models.TransferProgress {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var percentage float64
	if s.FileSize > 0 {
		percentage = (float64(s.TransferredBytes) / float64(s.FileSize)) * 100
		if percentage > 100 {
			percentage = 100
		}
	}

	return &models.TransferProgress{
		TransferID:       s.TransferID,
		Status:           s.Status,
		Direction:        s.Direction,
		FileName:         s.FileName,
		FileSize:         s.FileSize,
		TransferredBytes: s.TransferredBytes,
		Percentage:       percentage,
		Speed:            s.Speed,
		RemainingSeconds: s.RemainingSeconds,
		RemoteDeviceID:   s.RemoteDeviceID,
		RemoteDeviceName: s.RemoteDeviceName,
		CreatedAt:        s.CreatedAt,
		UpdatedAt:        s.UpdatedAt,
		Error:            s.ErrorMessage,
	}
}
