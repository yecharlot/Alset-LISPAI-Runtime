//go:build webview

package main

import (
	"log"

	webview "github.com/webview/webview_go"
)

func openWebView(url string) bool {
	w := webview.New(false)
	if w == nil {
		return false
	}
	defer w.Destroy()
	w.SetTitle("Alset Studio")
	w.SetSize(1280, 840, webview.HintNone)
	w.Navigate(url)
	log.Println("webview nativo activo")
	w.Run()
	return true
}
