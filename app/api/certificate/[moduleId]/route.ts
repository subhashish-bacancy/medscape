import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { moduleId: rawModuleId } = await params;
  const moduleId = Number(rawModuleId);

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  const certificate = await prisma.certificate.findUnique({
    where: {
      userId_moduleId: {
        userId: user.id,
        moduleId,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      module: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificate not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    certificate: {
      id: certificate.id,
      issuedAt: certificate.issuedAt,
      userName: certificate.user.name,
      userEmail: certificate.user.email,
      moduleName: certificate.module.title,
    },
  });
}
