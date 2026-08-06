package logger

import (
	"fmt"

	"go.uber.org/zap"
)

func New(cfg Config) (*Logger, error) {

	zapCfg := zap.NewDevelopmentConfig()

	switch cfg.Level {
	case LevelDebug:
		zapCfg.Level = zap.NewAtomicLevelAt(zap.DebugLevel)

	case LevelWarn:
		zapCfg.Level = zap.NewAtomicLevelAt(zap.WarnLevel)

	case LevelError:
		zapCfg.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)

	default:
		zapCfg.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	}

	logger, err := zapCfg.Build()
	if err != nil {
		return nil, fmt.Errorf(
			"failed to initialize logger: %w",
			err,
		)
	}

	return &Logger{
		Logger: logger,
	}, nil
}
