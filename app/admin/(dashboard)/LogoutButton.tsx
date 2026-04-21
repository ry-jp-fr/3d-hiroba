"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
    router.push("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="text-ink-muted hover:text-ink disabled:opacity-50"
    >
      {busy ? "..." : "ログアウト"}
    </button>
  );
}
