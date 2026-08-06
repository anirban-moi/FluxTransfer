package main

import (
	"log"

	"github.com/anirban-moi/FluxTransfer/backend/internal/app"
	"github.com/anirban-moi/FluxTransfer/backend/internal/config"
)

func main() {

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	application, err := app.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := application.Run(); err != nil {
		log.Fatal(err)
	}
}
