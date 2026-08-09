package models

type PairResponse struct {
	Version  int    `json:"version"`
	DeviceID string `json:"deviceId"`

	Accepted bool   `json:"accepted"`
	Reason   string `json:"reason"`
}
