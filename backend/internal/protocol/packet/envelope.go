package packet

import "encoding/json"

type Type string

const (
	TypeDiscovery    Type = "discovery"
	TypeHeartbeat    Type = "heartbeat"
	TypePairRequest  Type = "pair-request"
	TypePairResponse Type = "pair-response"
)

type Envelope struct {
	Type Type `json:"type"`

	Payload json.RawMessage `json:"payload"`
}
