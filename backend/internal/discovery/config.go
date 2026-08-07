package discovery

import "time"

type Config struct {
	BroadcastInterval time.Duration
	BroadcastPort     int
}
