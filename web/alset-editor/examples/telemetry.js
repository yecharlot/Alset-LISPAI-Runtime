/**
 * Alset JS Runtime — Telemetry / Pulse Demo
 * Shows how external systems can address nodes by key without global re-render.
 * Simulates an AIP pulse stream locally.
 */
import {
  AlsetInspector, Column, Row, Text, mod, alsetState,
  Card, Theme, AlsetRegistry, Spacer
} from '../../src/core/AlsetPulseCore.js';

const clock = alsetState("--:--:--");
const cpu = alsetState(0);
const mem = alsetState(0);
const status = alsetState("ONLINE");
const pulseLog = alsetState([]);

// Simulate an external telemetry service emitting pulses
function emitPulse(target, data) {
  const el = AlsetRegistry.get(target);
  if (el && el.__alsetPulse) {
    el.__alsetPulse(data);
  }
  // Also keep a visible log
  const log = pulseLog.get().slice(-6);
  log.push({ t: new Date().toLocaleTimeString(), target, data });
  pulseLog.set(log);
}

// Fake pulse generator
setInterval(() => {
  const now = new Date();
  emitPulse("telemetry-clock", {
    action: "DATA",
    value: now.toLocaleTimeString()
  });
}, 1000);

setInterval(() => {
  emitPulse("telemetry-cpu", {
    action: "DATA",
    value: Math.floor(20 + Math.random() * 60)
  });
  emitPulse("telemetry-mem", {
    action: "DATA",
    value: Math.floor(30 + Math.random() * 50)
  });
}, 1800);

setInterval(() => {
  const states = ["ONLINE", "SYNC", "IDLE"];
  emitPulse("telemetry-status", {
    action: "DATA",
    value: states[Math.floor(Math.random() * states.length)]
  });
}, 4000);

AlsetInspector(() => {
  Column(
    mod()
      .fillMaxSize()
      .background("#050505")
      .padding(32)
      .gap(24),
    () => {
      Text("AIP TELEMETRY DEMO", mod()
        .sizeText(13)
        .weight("900")
        .color("#555")
        .addStyle("letterSpacing", "3px"));

      Text("Nodes receive pulses by key · no global recompose",
        mod().sizeText(14).color("#888"));

      Row(mod().gap(20).wrap("wrap"), () => {
        // Clock node
        Card(
          mod()
            .key("telemetry-clock")
            .width(220)
            .padding(24)
            .gap(8),
          () => {
            // Attach pulse handler via state bridge
            const el = AlsetRegistry.get("telemetry-clock");
            if (el) {
              el.__alsetPulse = (p) => {
                if (p?.value !== undefined) clock.set(p.value);
              };
            }
            Text("CLOCK", mod().sizeText(11).color("#666").weight("800"));
            Text(clock.get(), mod().sizeText(32).weight("900").color(Theme.current.primary));
          }
        );

        // CPU node
        Card(
          mod()
            .key("telemetry-cpu")
            .width(220)
            .padding(24)
            .gap(8),
          () => {
            const el = AlsetRegistry.get("telemetry-cpu");
            if (el) {
              el.__alsetPulse = (p) => {
                if (p?.value !== undefined) cpu.set(p.value);
              };
            }
            Text("CPU LOAD", mod().sizeText(11).color("#666").weight("800"));
            Text(`${cpu.get()}%`, mod().sizeText(32).weight("900").color("#00FF41"));
            // Simple bar
            Column(mod()
              .height(6)
              .width("100%")
              .background("#222")
              .radius(3)
              .margin("8 0 0 0"), () => {
              Column(mod()
                .height(6)
                .width(`${cpu.get()}%`)
                .background("#00FF41")
                .radius(3), () => {});
            });
          }
        );

        // Memory node
        Card(
          mod()
            .key("telemetry-mem")
            .width(220)
            .padding(24)
            .gap(8),
          () => {
            const el = AlsetRegistry.get("telemetry-mem");
            if (el) {
              el.__alsetPulse = (p) => {
                if (p?.value !== undefined) mem.set(p.value);
              };
            }
            Text("MEMORY", mod().sizeText(11).color("#666").weight("800"));
            Text(`${mem.get()}%`, mod().sizeText(32).weight("900").color("#00F2FF"));
            Column(mod()
              .height(6)
              .width("100%")
              .background("#222")
              .radius(3)
              .margin("8 0 0 0"), () => {
              Column(mod()
                .height(6)
                .width(`${mem.get()}%`)
                .background("#00F2FF")
                .radius(3), () => {});
            });
          }
        );

        // Status node
        Card(
          mod()
            .key("telemetry-status")
            .width(220)
            .padding(24)
            .gap(8),
          () => {
            const el = AlsetRegistry.get("telemetry-status");
            if (el) {
              el.__alsetPulse = (p) => {
                if (p?.value !== undefined) status.set(p.value);
              };
            }
            Text("NODE STATUS", mod().sizeText(11).color("#666").weight("800"));
            Text(status.get(), mod()
              .sizeText(28)
              .weight("900")
              .color(status.get() === "ONLINE" ? "#00FF41" : "#FFD700"));
          }
        );
      });

      Spacer(12);

      // Pulse log
      Card(mod().padding(20).gap(8).width("100%").maxWidth(700), () => {
        Text("PULSE LOG (last 7)", mod().sizeText(11).color("#555").weight("800"));
        pulseLog.get().slice().reverse().forEach(entry => {
          Row(mod().gap(12), () => {
            Text(entry.t, mod().sizeText(11).color("#444").width(80));
            Text(entry.target, mod().sizeText(11).color(Theme.current.primary).width(140));
            Text(JSON.stringify(entry.data), mod().sizeText(11).color("#888"));
          });
        });
      });
    }
  );
});
