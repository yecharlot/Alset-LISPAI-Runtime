// Package mininode — núcleo Alset embebible (Mind · Zyrion · LispAI lite · mesh).
// Independiente del monolito PrismaTec; suficiente para Studio y apps desplegadas.
package mininode

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Node struct {
	mu       sync.RWMutex
	PeerID   string
	Episodes []map[string]any
	Peers    map[string]PeerInfo
	Facts    map[string]string // memoria simple
}

type PeerInfo struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	SeenAt   string `json:"seen_at"`
	Announce string `json:"announce,omitempty"`
}

func New() *Node {
	h := sha256.Sum256([]byte(fmt.Sprintf("mininode-%d", time.Now().UnixNano())))
	return &Node{
		PeerID:   "12D3KooM" + hex.EncodeToString(h[:16]),
		Episodes: nil,
		Peers:    map[string]PeerInfo{},
		Facts:    map[string]string{},
	}
}

func (n *Node) Info() map[string]any {
	n.mu.RLock()
	defer n.mu.RUnlock()
	peers := make([]PeerInfo, 0, len(n.Peers))
	for _, p := range n.Peers {
		peers = append(peers, p)
	}
	return map[string]any{
		"ok": true, "name": "Alset MiniNode", "peer_id": n.PeerID,
		"agents": len(n.Episodes), "peers": len(n.Peers), "peer_list": peers,
		"capabilities": []string{"mind", "zyrion", "lispai", "mesh", "gossip"},
		"api_version":  "mininode-1",
	}
}

// --- Zyrion ternary ---

func continuousToTernary(f float64) int {
	if f == 0 || f == 1 || f == 2 {
		return int(f)
	}
	if f < 0.33 {
		return 0
	}
	if f < 0.66 {
		return 1
	}
	return 2
}

// EvalZyrionSimple: entradas map name→float, salidas map "0"|"1"|"2"→label
func EvalZyrionSimple(env map[string]float64, labels map[string]string) map[string]any {
	// absorbente: si alguna entrada mapea a 2, resultado 2
	maxT := 0
	for _, v := range env {
		t := continuousToTernary(v)
		if t == 2 {
			maxT = 2
			break
		}
		if t > maxT {
			maxT = t
		}
	}
	key := strconv.Itoa(maxT)
	label := labels[key]
	if label == "" {
		label = key
	}
	return map[string]any{"ok": true, "ternary": maxT, "label": label, "env": env}
}

// --- Mind tick lite ---

type MindResult struct {
	Voice   string         `json:"voice"`
	Effect  int            `json:"effect"`
	Organs  map[string]int `json:"organs"`
	Episode string         `json:"episode,omitempty"`
	OK      bool           `json:"ok"`
}

func (n *Node) MindTick(text string) MindResult {
	n.mu.Lock()
	defer n.mu.Unlock()
	t := strings.ToLower(strings.TrimSpace(text))
	org := map[string]int{"dialog": 0, "act": 0, "mem": 0, "self": 0, "ethics": 0, "curiosity": 0, "humor": 0}
	voice := "Te escucho. Habla como quieras."
	effect := 0

	// ethics sink
	if strings.Contains(t, "borra") || strings.Contains(t, "contraseña") || strings.Contains(t, "password") || strings.Contains(t, "reset") {
		org["ethics"] = 2
		org["act"] = 0
		effect = 0
		voice = "No. Ethics en sumidero (2): no ejecuto borrados ni secretos."
		n.Episodes = append(n.Episodes, map[string]any{"text": text, "ethics": 2, "ts": time.Now().UTC().Format(time.RFC3339)})
		return MindResult{Voice: voice, Effect: effect, Organs: org, OK: true}
	}

	if strings.HasPrefix(t, "hola") || t == "hey" || t == "buenas" {
		org["dialog"] = 0
		voice = "Hola. Soy Alset Mind (mini-nodo). Habla como quieras."
	} else if strings.Contains(t, "quién eres") || strings.Contains(t, "quien eres") {
		org["self"] = 2
		voice = "Alset Mind lite en MiniNode: órganos ternarios, memoria local y Zyrion. No soy un LLM."
	} else if strings.Contains(t, "me llamo ") {
		name := strings.TrimSpace(t[strings.Index(t, "me llamo ")+9:])
		if name != "" {
			n.Facts["nombre"] = name
			org["mem"] = 2
			voice = "Queda anotado: te llamas " + name + "."
		}
	} else if strings.Contains(t, "cómo me llamo") || strings.Contains(t, "como me llamo") {
		org["mem"] = 2
		if nm, ok := n.Facts["nombre"]; ok {
			voice = "Te llamas " + nm + "."
		} else {
			voice = "Aún no me dijiste tu nombre en esta sesión."
		}
	} else if strings.Contains(t, "zyrion") {
		org["curiosity"] = 1
		voice = "Zyrion: lógica 0/1/2 con sumidero absorbente en 2. Usa POST /api/zyrion o (evaluar-zyrion …) en LispAI."
	} else if strings.Contains(t, "busca ") || strings.Contains(t, "quién es ") || strings.Contains(t, "quien es ") {
		org["curiosity"] = 2
		org["act"] = 1
		effect = 1
		voice = "MiniNode no sale a la web sola; conecta un rest-consumer o un gen en el nodo completo. Puedo recordar hechos que me digas."
	} else if len(t) > 0 {
		org["dialog"] = 1
		org["mem"] = 1
		n.Facts["ultimo"] = text
		voice = "Lo tengo presente. Si más tarde lo preguntas, lo traeré de esta memoria local."
	}

	ep := map[string]any{"text": text, "organs": org, "ts": time.Now().UTC().Format(time.RFC3339)}
	n.Episodes = append(n.Episodes, ep)
	if len(n.Episodes) > 64 {
		n.Episodes = n.Episodes[len(n.Episodes)-64:]
	}
	return MindResult{Voice: voice, Effect: effect, Organs: org, OK: true}
}

// --- LispAI subset ---

func (n *Node) LispEval(cmd string) map[string]any {
	cmd = strings.TrimSpace(cmd)
	if cmd == "" {
		return map[string]any{"error": "cmd vacío"}
	}
	// (evaluar-zyrion ...) simplified parse is heavy; expose dedicated endpoint
	if strings.Contains(cmd, "evaluar-zyrion") {
		return map[string]any{
			"resultado": "usa POST /api/zyrion con JSON {env, labels}",
			"hint":      "(evaluar-zyrion topo entorno) en nodo completo; aquí API dedicada",
		}
	}
	low := strings.ToLower(cmd)
	if strings.Contains(low, "hola") {
		return map[string]any{"resultado": "hola desde LispAI mini"}
	}
	// (+ a b)
	if strings.HasPrefix(cmd, "(+") {
		parts := strings.Fields(strings.Trim(cmd, "()"))
		sum := 0.0
		for i := 1; i < len(parts); i++ {
			f, _ := strconv.ParseFloat(parts[i], 64)
			sum += f
		}
		return map[string]any{"resultado": sum}
	}
	return map[string]any{"resultado": cmd, "note": "LispAI mini: subset; conecta PrismaTec para motor completo"}
}

// --- Mesh / gossip lite (rendezvous en proceso) ---

func (n *Node) Announce(id, name, payload string) {
	n.mu.Lock()
	defer n.mu.Unlock()
	if id == "" {
		id = name
	}
	n.Peers[id] = PeerInfo{ID: id, Name: name, SeenAt: time.Now().UTC().Format(time.RFC3339), Announce: payload}
}

func (n *Node) ListPeers() []PeerInfo {
	n.mu.RLock()
	defer n.mu.RUnlock()
	out := make([]PeerInfo, 0, len(n.Peers))
	for _, p := range n.Peers {
		out = append(out, p)
	}
	return out
}

func (n *Node) MemoryJSON() json.RawMessage {
	n.mu.RLock()
	defer n.mu.RUnlock()
	b, _ := json.Marshal(map[string]any{"facts": n.Facts, "episodes": n.Episodes})
	return b
}
