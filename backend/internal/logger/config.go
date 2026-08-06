package logger

type Config struct {
	Level string
}

const (
	LevelDebug = "debug"
	LevelInfo  = "info"
	LevelWarn  = "warn"
	LevelError = "error"

	FormatConsole = "console"
	FormatJSON    = "json"
)
