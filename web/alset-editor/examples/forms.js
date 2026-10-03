/**
 * Alset JS Runtime — Forms Example
 * Demonstrates: Input with key, validation feedback, LoginForm pattern, status states
 */
import {
  AlsetInspector, Column, Row, Text, mod, alsetState,
  Card, Input, Theme, Spacer
} from '../../src/core/AlsetPulseCore.js';

const email = alsetState("");
const password = alsetState("");
const emailError = alsetState("");
const status = alsetState("idle"); // idle | loading | success | error
const mode = alsetState("login");  // login | register

function validateEmail(val) {
  if (!val) return "Email is required";
  if (!val.includes("@") || !val.includes(".")) return "Invalid email format";
  return "";
}

function submit() {
  const err = validateEmail(email.get());
  emailError.set(err);
  if (err) return;

  status.set("loading");
  // Simulate network
  setTimeout(() => {
    if (password.get().length < 4) {
      status.set("error");
    } else {
      status.set("success");
    }
  }, 1200);
}

AlsetInspector(() => {
  Column(
    mod()
      .fillMaxSize()
      .background("#050505")
      .align("center", "center")
      .padding(24),
    () => {
      Card(
        mod()
          .key("auth-card")
          .width(380)
          .padding(36)
          .gap(20)
          .radius(28),
        () => {
          Text(mode.get() === "login" ? "Alset OS" : "Create Account",
            mod().sizeText(28).weight("900").color("#fff"));

          Text("Persistent identity · local resonance",
            mod().sizeText(12).color("#666").margin("0 0 8 0"));

          // Email
          Column(mod().gap(6), () => {
            Text("Email", mod().sizeText(12).color("#888"));
            Input(
              email,
              mod()
                .key("form-email")
                .padding(14)
                .radius(14)
                .background(emailError.get()
                  ? "rgba(139,0,0,0.25)"
                  : "rgba(255,255,255,0.05)")
                .border(emailError.get()
                  ? "1px solid #8B0000"
                  : "1px solid transparent")
                .color("#fff")
                .width("100%"),
              { placeholder: "you@alset.dev" }
            );
            if (emailError.get()) {
              Text(emailError.get(), mod().sizeText(11).color("#ff6b6b"));
            }
          });

          // Password
          Column(mod().gap(6), () => {
            Text("Password", mod().sizeText(12).color("#888"));
            Input(
              password,
              mod()
                .key("form-password")
                .padding(14)
                .radius(14)
                .background("rgba(255,255,255,0.05)")
                .color("#fff")
                .width("100%"),
              { placeholder: "••••••••", type: "password" }
            );
          });

          Spacer(4);

          // Submit
          const isLoading = status.get() === "loading";
          Column(
            mod()
              .background(isLoading ? "#333" : Theme.current.primary)
              .padding(14)
              .radius(14)
              .align("center", "center")
              .clickable(isLoading ? null : submit)
              .opacity(isLoading ? 0.7 : 1),
            () => Text(
              isLoading ? "AUTHENTICATING…" : (mode.get() === "login" ? "SIGN IN" : "REGISTER"),
              mod().color("#000").weight("900").sizeText(14)
            )
          );

          // Status feedback (local)
          if (status.get() === "success") {
            Card(mod().background("rgba(0,255,65,0.12)").border("1px solid #00FF41").padding(12), () => {
              Text("● Authenticated — identity preserved", mod().color("#00FF41").sizeText(13).weight("700"));
            });
          }
          if (status.get() === "error") {
            Card(mod().background("rgba(139,0,0,0.2)").border("1px solid #8B0000").padding(12), () => {
              Text("Authentication failed. Try again.", mod().color("#ff6b6b").sizeText(13));
            });
          }

          // Toggle mode
          Row(mod().align("center", "center").margin("8 0 0 0"), () => {
            Text(
              mode.get() === "login" ? "No account? " : "Already have an account? ",
              mod().sizeText(12).color("#666")
            );
            Text(
              mode.get() === "login" ? "Register" : "Sign in",
              mod()
                .sizeText(12)
                .color(Theme.current.primary)
                .weight("700")
                .clickable(() => {
                  mode.set(mode.get() === "login" ? "register" : "login");
                  status.set("idle");
                  emailError.set("");
                })
            );
          });
        }
      );
    }
  );
});
