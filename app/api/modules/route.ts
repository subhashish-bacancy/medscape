import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getModulesWithProgress } from "@/lib/training";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const modules = await getModulesWithProgress(user.id);

  return NextResponse.json({ modules });
}
