package identity

import "time"

type Identity struct {
	DeviceID  string    `json:"deviceId"`
	CreatedAt time.Time `json:"createdAt"`
}
