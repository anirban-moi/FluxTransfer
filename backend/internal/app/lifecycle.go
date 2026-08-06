package app

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"
)

func (a *Application) Run() error {

	a.logger.Info(
		"Configuration loaded",
		zap.String(
			"device",
			a.cfg.Device.Name,
		),
	)

	go func() {

		if err := a.server.Start(); err != nil {
			a.logger.Fatal(
				"Failed to start HTTP server",
				zap.Error(err),
			)
		}

	}()

	quit := make(chan os.Signal, 1)

	signal.Notify(
		quit,
		os.Interrupt,
		syscall.SIGTERM,
	)

	<-quit

	a.logger.Info(
		"Shutdown signal received",
	)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	if err := a.server.Shutdown(ctx); err != nil {

		a.logger.Error(
			"Failed to shutdown server",
			zap.Error(err),
		)

		return err
	}

	a.logger.Info("Backend stopped")

	return nil
}
