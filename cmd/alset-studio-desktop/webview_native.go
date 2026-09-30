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
	// Pantalla grande / maximizada
	w.SetSize(1920, 1080, webview.HintMax)
	w.Navigate(url)
	// Pedir fullscreen real del documento cuando cargue
	w.Init(`
(function(){
  function goFS(){
    try {
      var el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) {}
  }
  if (document.readyState === 'complete') setTimeout(goFS, 300);
  else window.addEventListener('load', function(){ setTimeout(goFS, 300); });
})();
`)
	log.Println("webview nativo maximizado / fullscreen")
	w.Run()
	return true
}
