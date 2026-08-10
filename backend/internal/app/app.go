package app

import (
	"time"

	"github.com/anirban-moi/FluxTransfer/backend/internal/appdata"
	"github.com/anirban-moi/FluxTransfer/backend/internal/config"
	deviceServicePkg "github.com/anirban-moi/FluxTransfer/backend/internal/device"
	"github.com/anirban-moi/FluxTransfer/backend/internal/device/identity"
	"github.com/anirban-moi/FluxTransfer/backend/internal/discovery"
	"github.com/anirban-moi/FluxTransfer/backend/internal/heartbeat"
	"github.com/anirban-moi/FluxTransfer/backend/internal/logger"
	"github.com/anirban-moi/FluxTransfer/backend/internal/models"
	"github.com/anirban-moi/FluxTransfer/backend/internal/network/udp"
	"github.com/anirban-moi/FluxTransfer/backend/internal/pairing"
	"github.com/anirban-moi/FluxTransfer/backend/internal/registry"
	"github.com/anirban-moi/FluxTransfer/backend/internal/server"
	"github.com/anirban-moi/FluxTransfer/backend/internal/trusted"
)

type Application struct {
	cfg            *config.Config
	logger         *logger.Logger
	identity       *identity.Identity
	server         *server.Server
	registry       registry.Registry
	discovery      *discovery.Service
	heartbeat      *heartbeat.Service
	pairing        *pairing.Service
	trusted        *trusted.Service
	udpListener    *udp.Listener
	udpDispatcher  *udp.Dispatcher
	udpBroadcaster *udp.Broadcaster
}

func New(
	cfg *config.Config,
) (*Application, error) {

	// Logger
	logCfg := logger.Config{
		Level: cfg.Logging.Level,
	}

	appLogger, err := logger.New(logCfg)
	if err != nil {
		return nil, err
	}

	// ------------------------------------------------------------
	// Device Identity
	// ------------------------------------------------------------

	appDataDir, err := appdata.Directory()
	if err != nil {
		return nil, err
	}

	identityStorage := identity.NewStorage(
		appDataDir,
	)

	identityService := identity.NewIdentityService(
		identityStorage,
	)

	identityInfo, err := identityService.Load()
	if err != nil {
		return nil, err
	}

	// Device Registry
	deviceRegistry := registry.New()

	// Device Service
	deviceService := deviceServicePkg.New(
		deviceRegistry,
	)

	// Local Device
	device := &models.Device{
		ID:       identityInfo.DeviceID,
		Name:     cfg.Device.Name,
		Hostname: "localhost",
		Platform: "windows",
		Port:     53318,
		Version:  "0.1.0-dev",
		Status:   models.StatusOnline,
	}

	// Discovery Configuration
	discoveryCfg := discovery.Config{
		BroadcastInterval: 5 * time.Second,
		BroadcastPort:     53317,
	}

	// Heartbeat Configuration
	heartbeatCfg := heartbeat.Config{
		Interval:     5 * time.Second,
		OfflineAfter: 15 * time.Second,
	}

	// ------------------------------------------------------------------
	// Shared UDP Infrastructure
	// ------------------------------------------------------------------

	udpListenerConn, err := udp.Listen(
		discoveryCfg.BroadcastPort,
	)
	if err != nil {
		return nil, err
	}

	udpBroadcastConn, err := udp.Dial(
		discoveryCfg.BroadcastPort,
	)
	if err != nil {
		return nil, err
	}

	udpBroadcaster := udp.NewBroadcaster(
		appLogger,
		udpBroadcastConn,
	)

	dispatcher := udp.NewDispatcher()

	udpListener := udp.NewListener(
		udpListenerConn,
		dispatcher,
	)

	udpSender := udp.NewSender(
		appLogger,
	)

	// ------------------------------------------------------------------
	// Services
	// ------------------------------------------------------------------

	discoveryService := discovery.New(
		discoveryCfg,
		appLogger,
		device,
		deviceService,
		udpBroadcaster,
	)

	heartbeatService := heartbeat.New(
		heartbeatCfg,
		appLogger,
		device,
		deviceService,
	)

	// Register protocol handlers
	dispatcher.Register(
		discovery.NewHandler(discoveryService),
	)

	dispatcher.Register(
		heartbeat.NewHandler(heartbeatService),
	)

	// pairing services

	pendingRegistry := pairing.NewPendingRegistry()

	trustedRepository, err := trusted.NewJSONRepository(
		"data/trusted_devices.json",
	)
	if err != nil {
		return nil, err
	}

	trustedService := trusted.NewService(
		trustedRepository,
	)

	// pairing servicesx
	pairingService := pairing.New(
		appLogger,
		device,
		deviceService,
		udpBroadcaster,
		udpSender,
		pendingRegistry,
		trustedService,
	)

	// HTTP Server
	httpServer := server.New(
		cfg,
		appLogger,
		deviceRegistry,
		device,
		pairingService,
	)

	dispatcher.Register(
		pairing.NewHandler(pairingService),
	)

	return &Application{
		cfg:            cfg,
		logger:         appLogger,
		server:         httpServer,
		registry:       deviceRegistry,
		discovery:      discoveryService,
		heartbeat:      heartbeatService,
		pairing:        pairingService,
		trusted:        trustedService,
		udpListener:    udpListener,
		udpDispatcher:  dispatcher,
		udpBroadcaster: udpBroadcaster,
	}, nil
}
