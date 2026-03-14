import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { removeProfileImage, uploadProfileImage } from "@/lib/supabase-storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const avatar = formData.get("avatar");

  if (!(avatar instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!(avatar.type in ALLOWED_TYPES)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG, PNG, WEBP, or GIF." },
      { status: 400 },
    );
  }

  if (avatar.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Max size is 2MB." },
      { status: 400 },
    );
  }

  let profileImageUrl: string;

  try {
    const upload = await uploadProfileImage(user.id, avatar);
    profileImageUrl = upload.publicUrl;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload avatar to Supabase Storage.",
      },
      { status: 500 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { profileImageUrl },
  });

  if (user.profileImageUrl && user.profileImageUrl !== profileImageUrl) {
    try {
      await removeProfileImage(user.profileImageUrl);
    } catch (error) {
      console.error("Unable to remove previous profile image", error);
    }
  }

  return NextResponse.json({ profileImageUrl });
}
