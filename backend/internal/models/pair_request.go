package models

type PairRequest struct {
	DeviceID string
	Name     string
	Hostname string
	Platform string
	Version  string

	PublicKey string // Placeholder for now
}
