package models

import "time"

type DeviceStatus string

const (
	StatusOnline     DeviceStatus = "online"
	StatusOffline    DeviceStatus = "offline"
	StatusConnecting DeviceStatus = "connecting"
)

type Device struct {
	ID        string
	Name      string
	Hostname  string
	Platform  string
	IPAddress string
	Port      int
	Status    DeviceStatus
	LastSeen  time.Time
	Version   string
}
