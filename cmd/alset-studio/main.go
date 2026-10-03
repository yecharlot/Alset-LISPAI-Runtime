package main

import (
	"flag"
	"log"

	"github.com/yecharlot/Alset-LISPAI-Runtime/internal/studioserver"
)

func main() {
	addr := flag.String("addr", ":5177", "listen address")
	dir := flag.String("dir", "web", "web root")
	data := flag.String("data", "", "data dir (default ~/.alset-studio)")
	flag.Parse()
	if err := studioserver.Run(*addr, *dir, *data); err != nil {
		log.Fatal(err)
	}
}
