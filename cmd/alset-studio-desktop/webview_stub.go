//go:build !webview

package main

// openWebView no disponible sin -tags webview.
func openWebView(url string) bool { return false }
