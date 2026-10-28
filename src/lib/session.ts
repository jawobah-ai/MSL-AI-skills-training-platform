import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode, store } from "@/lib/store";
import { supabaseServer } from "@/lib/store/supabase";
import type { Role, User } from "@/lib/types";

export const DEMO_COOKIE = "msl_demo_user";

export async function getCurrentUser(): Promise<User | null> {
  if (isDemoMode) {
    const id = (await cookies()).get(DEMO_COOKIE)?.value;
    return id ? store.getUser(id) : null;
  }
  const db = await supabaseServer();
  const { data } = await db.auth.getUser();
  return data.user ? store.getUser(data.user.id) : null;
}

export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (role && user.role !== role) redirect(user.role === "grader" ? "/grade" : "/learn");
  return user;
}
