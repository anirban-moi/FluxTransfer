package models

import "time"

type TransferStatus string

const (
	TransferStatusCreated     TransferStatus = "created"
	TransferStatusPending     TransferStatus = "pending"
	TransferStatusPreparing   TransferStatus = "preparing"
	TransferStatusRunning     TransferStatus = "running"
	TransferStatusPaused      TransferStatus = "paused"
	TransferStatusVerifying   TransferStatus = "verifying"
	TransferStatusCompleted   TransferStatus = "completed"
	TransferStatusFailed      TransferStatus = "failed"
	TransferStatusCancelled   TransferStatus = "cancelled"
)

type TransferDirection string

const (
	TransferDirectionOutgoing TransferDirection = "outgoing"
	TransferDirectionIncoming TransferDirection = "incoming"
)

type TransferRequest struct {
	TransferID string `json:"transferId"`
	SenderID   string `json:"senderId"`
	SenderName string `json:"senderName"`
	TargetID   string `json:"targetId"`
	FileName   string `json:"fileName"`
	FileSize   int64  `json:"fileSize"`
	TotalFiles int    `json:"totalFiles"`
	Checksum   string `json:"checksum"` // SHA-256
	Port       int    `json:"port"`     // Receiver or Sender transfer port
}

type TransferResponse struct {
	TransferID string `json:"transferId"`
	ReceiverID string `json:"receiverId"`
	Accepted   bool   `json:"accepted"`
	Reason     string `json:"reason"`
	Port       int    `json:"port"`
}

type TransferProgress struct {
	TransferID       string            `json:"transferId"`
	Status           TransferStatus    `json:"status"`
	Direction        TransferDirection `json:"direction"`
	FileName         string            `json:"fileName"`
	FileSize         int64             `json:"fileSize"`
	TransferredBytes int64             `json:"transferredBytes"`
	Percentage       float64           `json:"percentage"`
	Speed            int64             `json:"speed"` // Bytes per second
	RemainingSeconds int64             `json:"remainingSeconds"`
	RemoteDeviceID   string            `json:"remoteDeviceId"`
	RemoteDeviceName string            `json:"remoteDeviceName"`
	CreatedAt        time.Time         `json:"createdAt"`
	UpdatedAt        time.Time         `json:"updatedAt"`
	Error            string            `json:"error,omitempty"`
}
