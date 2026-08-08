package heartbeat

import "time"

type Config struct {
	Interval time.Duration

	OfflineAfter time.Duration
}
