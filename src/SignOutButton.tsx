import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return (
      <button className="btn-ghost" onClick={() => { window.location.href = "/login"; }}>
        Sign in
      </button>
    );
  }

  return (
    <button className="btn-ghost" onClick={() => void signOut()}>
      Sign out
    </button>
  );
}
