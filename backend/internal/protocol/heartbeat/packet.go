package heartbeat

type Packet struct {
	Version  uint16 `json:"version"`
	DeviceID string `json:"deviceId"`
	UnixTime int64  `json:"unixTime"`
}
