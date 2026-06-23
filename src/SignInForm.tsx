import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface SignInFormProps {
  onSuccess?: () => void;
}

type Flow = "signIn" | "signUp" | "forgotPassword" | "resetPassword";

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<Flow>("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetCodeFromServer, setResetCodeFromServer] = useState<string | null>(null);

  // Query the latest code AFTER signIn creates it
  const latestCode = useQuery(
    api.passwordReset.getLatestCode,
    resetEmail ? { email: resetEmail } : "skip",
  );

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.set("email", resetEmail);
    formData.set("flow", "reset");
    try {
      await signIn("password", formData);
      // Wait a tick for the code to be created in DB
      setTimeout(() => {
        setSubmitting(false);
        setResetCodeFromServer(latestCode?.code ?? "check console");
        setFlow("resetPassword");
      }, 1000);
    } catch (error: any) {
      setSubmitting(false);
      toast.error(error.message ?? "Failed to send reset code");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", "reset-verify");
    try {
      await signIn("password", formData);
      setSubmitting(false);
      toast.success("Password reset successfully!");
      onSuccess?.();
    } catch (error: any) {
      setSubmitting(false);
      toast.error(error.message ?? "Failed to reset password");
    }
  };

  return (
    <div className="w-full space-y-4">
      {flow === "forgotPassword" && (
        <form onSubmit={(e) => { void handleSendResetCode(e); }} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a password reset code.
          </p>
          <input
            className="auth-input-field"
            type="email"
            name="email"
            placeholder="Email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Code"}
          </button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => setFlow("signIn")}
          >
            Back to sign in
          </button>
        </form>
      )}

      {flow === "resetPassword" && (
        <form onSubmit={(e) => { void handleResetPassword(e); }} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            A verification code has been generated. In production this would be
            emailed to you. For this demo, use the code below:
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
            <span className="text-2xl font-mono font-bold tracking-widest text-yellow-300">
              {latestCode?.code ?? resetCodeFromServer ?? "..."}
            </span>
          </div>
          <input type="hidden" name="email" value={resetEmail} />
          <input
            className="auth-input-field"
            type="text"
            name="code"
            placeholder="Verification code"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
          />
          <input
            className="auth-input-field"
            type="password"
            name="newPassword"
            placeholder="New password (min 8 chars)"
            minLength={8}
            required
          />
          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => setFlow("signIn")}
          >
            Back to sign in
          </button>
        </form>
      )}

      {(flow === "signIn" || flow === "signUp") && (
        <form
          className="flex flex-col gap-3"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData).then(() => {
              setSubmitting(false);
              onSuccess?.();
            }).catch((error) => {
              setSubmitting(false);
              const msg = error.message ?? "";
              let toastTitle = "";
              if (/wrong password|invalid password|invalid email/i.test(msg)) {
                toastTitle = "Invalid email or password. Please try again.";
              } else if (/no account|not found|doesn't exist/i.test(msg)) {
                toastTitle = "No account found with that email. Did you mean to sign up?";
              } else if (/already exists/i.test(msg)) {
                toastTitle = "An account with this email already exists. Did you mean to sign in?";
              } else if (/rate limit|too many/i.test(msg)) {
                toastTitle = "Too many attempts. Please wait a moment and try again.";
              } else {
                toastTitle = msg || (flow === "signIn"
                  ? "Sign in failed. Please try again."
                  : "Sign up failed. Please try again.");
              }
              toast.error(toastTitle);
            });
          }}
        >
          <input
            className="auth-input-field"
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="off"
            required
          />
          <input aria-hidden="true" tabIndex={-1} autoComplete="off"
            type="text" name="fake_username" style={{ position: "absolute", opacity: 0, height: 0 }} />
          <input aria-hidden="true" tabIndex={-1} autoComplete="off"
            type="password" name="fake_password" style={{ position: "absolute", opacity: 0, height: 0 }} />
          <input
            className="auth-input-field"
            type="password"
            name="password"
            placeholder={flow === "signIn" ? "Password" : "Password (min 8 chars)"}
            autoComplete="off"
            minLength={8}
            required
          />
          <button className="auth-button" type="submit" disabled={submitting}>
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </button>
          <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
            <div>
              <span>
                {flow === "signIn"
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
              </button>
            </div>
            {flow === "signIn" && (
              <button
                type="button"
                className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
                onClick={() => setFlow("forgotPassword")}
              >
                Forgot password?
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
