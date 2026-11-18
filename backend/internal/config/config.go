package config

type ServerConfig struct {
	Host string
	Port int
}

type LoggingConfig struct {
	Level string
}

type DeviceConfig struct {
	Name string
}

type DiscoveryConfig struct {
	Enabled  bool
	Port     int
	Interval int
}

type TransferConfig struct {
	Host      string
	Port      int
	ChunkSize int
	Timeout   int
	SaveDir   string
}

type Config struct {
	Server    ServerConfig
	Logging   LoggingConfig
	Device    DeviceConfig
	Discovery DiscoveryConfig
	Transfer  TransferConfig
}
