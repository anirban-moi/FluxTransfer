package models

import "time"

type DeviceStatus string

const (
	StatusOnline     DeviceStatus = "online"
	StatusOffline    DeviceStatus = "offline"
	StatusConnecting DeviceStatus = "connecting"
)

type Device struct {
	ID        string       `json:"id"`
	Name      string       `json:"name"`
	Hostname  string       `json:"hostname"`
	Platform  string       `json:"platform"`
	IPAddress string       `json:"ipAddress"`
	Port      int          `json:"port"`
	Status    DeviceStatus `json:"status"`
	LastSeen  time.Time    `json:"lastSeen"`
	Version   string       `json:"version"`
}
