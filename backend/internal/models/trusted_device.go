package models

import "time"

type TrustedDevice struct {
	DeviceID string
	Name     string
	Hostname string
	Platform string
	Version  string

	PublicKey string

	PairedAt time.Time
	LastSeen time.Time
}
