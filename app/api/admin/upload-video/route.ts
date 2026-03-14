import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { uploadTrainingVideo } from "@/lib/supabase-storage";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const video = formData.get("video");

  if (!(video instanceof File)) {
    return NextResponse.json({ error: "No video uploaded." }, { status: 400 });
  }

  if (!ALLOWED_VIDEO_TYPES.has(video.type)) {
    return NextResponse.json(
      { error: "Unsupported video type. Use MP4, WEBM, or MOV." },
      { status: 400 },
    );
  }

  if (video.size > MAX_VIDEO_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Video too large. Max size is 50MB." },
      { status: 400 },
    );
  }

  try {
    const upload = await uploadTrainingVideo(user.id, video);
    return NextResponse.json({ videoUrl: upload.publicUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload training video.",
      },
      { status: 500 },
    );
  }
}
