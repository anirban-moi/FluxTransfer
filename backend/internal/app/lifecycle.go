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

	go func() {

		if err := a.udpListener.Listen(appCtx); err != nil {

			a.logger.Error(
				"UDP listener stopped",
				zap.Error(err),
			)

		}

	}()

	// Start Discovery Service
	if err := a.discovery.Start(appCtx); err != nil {

		a.logger.Fatal(
			"Failed to start discovery service",
			zap.Error(err),
		)

	}

	if err := a.heartbeat.Start(appCtx); err != nil {

		a.logger.Fatal(
			"Failed to start heartbeat service",
			zap.Error(err),
		)

	}

	if err := a.pairing.Start(appCtx); err != nil {

		a.logger.Fatal(
			"Failed to start pairing service",
			zap.Error(err),
		)

	}

	// Start HTTP Server
	go func() {
		if err := a.server.Start(); err != nil {
			a.logger.Error(
				"HTTP server stopped",
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

	if err := a.heartbeat.Shutdown(shutdownCtx); err != nil {
		a.logger.Error(
			"Failed to shutdown heartbeat service",
			zap.Error(err),
		)
	}

	if err := a.discovery.Shutdown(shutdownCtx); err != nil {
		a.logger.Error(
			"Failed to shutdown discovery service",
			zap.Error(err),
		)
	}

	if err := a.pairing.Shutdown(shutdownCtx); err != nil {

		a.logger.Error(
			"Failed to shutdown pairing service",
			zap.Error(err),
		)

	}

	a.logger.Info("Backend stopped")

	return nil
}
