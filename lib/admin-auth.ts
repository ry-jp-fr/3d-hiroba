import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "hiroba_admin";

export function adminPasswordEnabled(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length > 0,
  );
}

export async function isAdminAuthed(): Promise<boolean> {
  if (!adminPasswordEnabled()) return true;
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  return value === process.env.ADMIN_PASSWORD;
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdminAuthed();
  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
