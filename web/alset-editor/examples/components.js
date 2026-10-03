/**
 * Alset Components Showcase
 * Demonstrates FormField, StatusBadge, LivePanel, Skeleton
 */
import {
  AlsetInspector, Column, Row, Text, mod, alsetState,
  Card, Button, Theme, Spacer
} from '../../src/core/AlsetPulseCore.js';

import {
  FormField, StatusBadge, StatusBlock, LivePanel, LiveDot,
  SkeletonCard, ensureSkeletonStyles
} from '../../src/components/index.js';

ensureSkeletonStyles();

const email = alsetState("");
const password = alsetState("");
const status = alsetState("idle");
const live = alsetState(true);
const showSkeleton = alsetState(false);

function submit() {
  status.set("loading");
  setTimeout(() => {
    if (!email.get().includes("@") || password.get().length < 4) {
      status.set("error");
    } else {
      status.set("success");
    }
  }, 1400);
}

AlsetInspector(() => {
  Column(
    mod()
      .fillMaxSize()
      .background("#050505")
      .padding(40)
      .gap(32)
      .align("start", "center"),
    () => {
      Text("ALSET COMPONENTS", mod()
        .sizeText(13).weight("900").color("#555")
        .addStyle("letterSpacing", "3px"));

      Text("FormField · Status · LivePanel · Skeleton",
        mod().sizeText(22).weight("800").color("#fff"));

      Row(mod().gap(28).wrap("wrap").align("start", "start"), () => {

        // --- Form ---
        Card(mod().width(340).padding(28).gap(16), () => {
          Text("FormField + Status", mod().sizeText(14).weight("800").color("#FFD700"));

          FormField({
            label: "Email",
            state: email,
            keyId: "demo-email",
            placeholder: "you@alset.dev",
            validate: (v) => {
              if (!v) return "Required";
              if (!v.includes("@")) return "Invalid email";
              return "";
            }
          });

          FormField({
            label: "Password",
            state: password,
            keyId: "demo-password",
            type: "password",
            placeholder: "••••••••"
          });

          Button("Submit", submit, mod().width("100%"));

          StatusBlock(status.get(), {
            loading: "Authenticating…",
            error: "Check credentials and try again",
            success: "● Signed in — identity preserved"
          });

          Row(mod().gap(10).margin("8 0 0 0").align("center", "start"), () => {
            StatusBadge(status.get());
          });
        });

        // --- LivePanel ---
        LivePanel({
          keyId: "demo-live-panel",
          live: () => live.get(),
          label: "LIVE",
          m: mod().width(340),
          childrenBlock: () => {
            Text("LivePanel", mod().sizeText(14).weight("800").color("#00FF41").margin("0 0 8 0"));
            Text("This node can receive MUTATE_LOGIC pulses. The green border and badge make mutability visible.",
              mod().sizeText(13).color("#aaa").margin("0 0 16 0"));

            Row(mod().gap(10).align("center", "start"), () => {
              LiveDot(() => live.get());
              Text(live.get() ? "Mutation enabled (CONTROLLED)" : "Mutation disabled",
                mod().sizeText(12).color(live.get() ? "#00FF41" : "#666"));
            });

            Spacer(12);

            Button(
              live.get() ? "Disable LIVE" : "Enable LIVE",
              () => live.set(!live.get()),
              mod().padding("8px 16px").radius(10)
                .background(live.get() ? "#003300" : "#222")
            );
          }
        });

        // --- Skeleton ---
        Column(mod().width(300).gap(12), () => {
          Text("Skeleton", mod().sizeText(14).weight("800").color("#FFD700"));

          Button(
            showSkeleton.get() ? "Hide skeleton" : "Show skeleton",
            () => showSkeleton.set(!showSkeleton.get()),
            mod().padding("8px 16px").radius(10).background("#222")
          );

          if (showSkeleton.get()) {
            SkeletonCard();
          } else {
            Card(mod().padding(20).gap(8), () => {
              Text("Content loaded", mod().weight("700").color("#fff"));
              Text("Skeletons are local — they never block the whole viewport.",
                mod().sizeText(12).color("#888"));
            });
          }
        });
      });
    }
  );
});
