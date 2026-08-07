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

	// Application context shared by all long-running services.
	appCtx, appCancel := context.WithCancel(context.Background())
	defer appCancel()

	// Start HTTP Server
	go func() {
		if err := a.server.Start(); err != nil {
			a.logger.Error(
				"HTTP server stopped",
				zap.Error(err),
			)
		}
	}()

	// Start Discovery Service
	go func() {
		if err := a.discovery.Start(appCtx); err != nil {
			a.logger.Error(
				"Discovery service stopped",
				zap.Error(err),
			)
		}
	}()

	// Wait for shutdown signal.
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

	// Notify all background services to stop.
	appCancel()

	// Allow services a moment to exit cleanly.
	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	// Shutdown HTTP Server
	if err := a.server.Shutdown(shutdownCtx); err != nil {

		a.logger.Error(
			"Failed to shutdown HTTP server",
			zap.Error(err),
		)

		return err
	}

	a.logger.Info("Backend stopped")

	return nil
}
