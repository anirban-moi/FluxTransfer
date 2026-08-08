package heartbeat

import (
	"context"
	"time"

	devicepkg "github.com/anirban-moi/FluxTransfer/backend/internal/device"
)

type Cleaner struct {
	config Config

	deviceService devicepkg.Service
}

func NewCleaner(
	cfg Config,
	service devicepkg.Service,
) *Cleaner {

	return &Cleaner{
		config:        cfg,
		deviceService: service,
	}
}

func (c *Cleaner) Start(
	ctx context.Context,
) {

	ticker := time.NewTicker(
		c.config.Interval,
	)

	defer ticker.Stop()

	for {

		select {

		case <-ctx.Done():
			return

		case <-ticker.C:

			now := time.Now()

			for _, device := range c.deviceService.List() {

				if now.Sub(device.LastSeen) >
					c.config.OfflineAfter {

					c.deviceService.MarkOffline(
						device.ID,
					)
				}
			}
		}
	}
}
