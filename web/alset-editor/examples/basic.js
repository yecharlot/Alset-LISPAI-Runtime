/**
 * Alset JS Runtime — Basic Example
 * Demonstrates: alsetState, Column/Row/Text/Button, Theme, key persistence
 */
import {
  AlsetInspector, Column, Row, Text, mod, alsetState,
  Card, Button, Spacer, Theme
} from '../../src/core/AlsetPulseCore.js';

// Reactive state
const count = alsetState(0);
const message = alsetState("Welcome to Alset");

AlsetInspector(() => {
  Column(
    mod()
      .fillMaxSize()
      .background(Theme.current.background)
      .align("center", "center")
      .gap(24)
      .padding(32),
    () => {
      // Header
      Text("ALSET RUNTIME", mod()
        .sizeText(14)
        .weight("900")
        .color("#555")
        .addStyle("letterSpacing", "4px"));

      Text(message.get(), mod()
        .sizeText(36)
        .weight("900")
        .color(Theme.current.primary));

      Spacer(8);

      // Counter card with persistent identity
      Card(
        mod()
          .key("counter-card")
          .width(320)
          .padding(28)
          .align("center", "center")
          .gap(16),
        () => {
          Text(`Count: ${count.get()}`, mod()
            .sizeText(48)
            .weight("900")
            .color("#fff")
            .key("count-display"));

          Row(mod().gap(12), () => {
            Button("−", () => count.set(Math.max(0, count.get() - 1)),
              mod().width(64).background("#222").radius(12));
            Button("+", () => count.set(count.get() + 1),
              mod().width(64));
          });
        }
      );

      // Theme switcher
      Row(mod().gap(12).margin("20 0 0 0"), () => {
        Button("Gold", () => {
          Theme.set({ primary: "#FFD700", secondary: "#8B0000" });
          message.set("Theme: Gold");
        }, mod().padding("10px 18px").radius(10));

        Button("Cyan", () => {
          Theme.set({ primary: "#00F2FF", secondary: "#003344" });
          message.set("Theme: Cyan");
        }, mod().padding("10px 18px").radius(10).background("#00F2FF"));

        Button("Matrix", () => {
          Theme.set({ primary: "#00FF41", secondary: "#003300" });
          message.set("Theme: Matrix");
        }, mod().padding("10px 18px").radius(10).background("#00FF41"));
      });

      Text("Identity persists · only addressed nodes recompose",
        mod().sizeText(12).color("#444").margin("24 0 0 0"));
    }
  );
});
