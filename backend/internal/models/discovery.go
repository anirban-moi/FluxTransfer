package models

const (
	DiscoveryProtocolVersion = 1
	DefaultDiscoveryPort     = 53317
	DefaultTransferPort      = 53318
)

type DiscoveryMessageType string

const (
	MessageDiscover  DiscoveryMessageType = "discover"
	MessageResponse  DiscoveryMessageType = "response"
	MessageHeartbeat DiscoveryMessageType = "heartbeat"
)

type DiscoveryPacket struct {
	// Protocol Version
	Version int `json:"version"`
	// Packet Type
	Type DiscoveryMessageType `json:"type"`
	// Device Identity
	DeviceID    string `json:"deviceId"`
	Name        string `json:"name"`
	Hostname    string `json:"hostname"`
	Platform    string `json:"platform"`
	VersionName string `json:"versionName"`
	// Network
	TransferPort int `json:"transferPort"`
}
