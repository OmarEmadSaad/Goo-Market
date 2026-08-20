import "server-only";

import { NextResponse } from "next/server";
import { getCurrentUser } from "./session";
import type { PublicUser } from "../types";

export async function requireAdmin(): Promise<
  { user: PublicUser } | { response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json(
        { ok: false, message: "Not signed in." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      response: NextResponse.json(
        { ok: false, message: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return { user };
}
