import { randomUUID } from "node:crypto";

const DEFAULT_PROFILE_IMAGE_BUCKET = "profile-images";
const DEFAULT_TRAINING_VIDEO_BUCKET = "training-videos";
const IMAGE_ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const VIDEO_ALLOWED_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL must be configured.");
  }

  return url.replace(/\/$/, "");
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be configured.");
  }

  return key;
}

export function getProfileImageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_PROFILE_IMAGE_BUCKET;
}

export function getTrainingVideoBucket() {
  return process.env.SUPABASE_TRAINING_VIDEO_BUCKET ?? DEFAULT_TRAINING_VIDEO_BUCKET;
}

function getStorageHeaders(extraHeaders?: HeadersInit) {
  const serviceRoleKey = getServiceRoleKey();

  return {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    ...extraHeaders,
  };
}

function encodeObjectPath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function readErrorMessage(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string; message?: string }
    | null;

  return payload?.message ?? payload?.error ?? response.statusText;
}

export async function ensureStorageBucket(input: {
  bucket: string;
  allowedMimeTypes: string[];
  fileSizeLimitBytes: number;
}) {
  const supabaseUrl = getSupabaseUrl();
  const bucketListResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    headers: getStorageHeaders(),
    method: "GET",
  });

  if (!bucketListResponse.ok) {
    throw new Error(
      `Unable to access storage buckets: ${await readErrorMessage(bucketListResponse)}`,
    );
  }

  const bucketList = (await bucketListResponse.json().catch(() => [])) as Array<{
    id?: string;
    name?: string;
  }>;

  const bucketExists = bucketList.some(
    (entry) => entry.id === input.bucket || entry.name === input.bucket,
  );

  if (bucketExists) {
    return;
  }

  const createBucket = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    body: JSON.stringify({
      id: input.bucket,
      name: input.bucket,
      public: true,
      file_size_limit: input.fileSizeLimitBytes,
      allowed_mime_types: input.allowedMimeTypes,
    }),
    headers: getStorageHeaders({
      "Content-Type": "application/json",
    }),
    method: "POST",
  });

  if (!createBucket.ok && createBucket.status !== 409) {
    throw new Error(
      `Unable to create storage bucket: ${await readErrorMessage(createBucket)}`,
    );
  }
}

export async function uploadPublicFile(input: {
  bucket: string;
  directory: string;
  file: File;
  allowedTypes: Record<string, string>;
  fileNamePrefix: string;
  fileSizeLimitBytes: number;
}) {
  const extension = input.allowedTypes[input.file.type];

  if (!extension) {
    throw new Error("Unsupported file type.");
  }

  if (input.file.size > input.fileSizeLimitBytes) {
    throw new Error("File exceeds the configured upload size limit.");
  }

  await ensureStorageBucket({
    bucket: input.bucket,
    allowedMimeTypes: Object.keys(input.allowedTypes),
    fileSizeLimitBytes: input.fileSizeLimitBytes,
  });

  const supabaseUrl = getSupabaseUrl();
  const objectPath = `${input.directory}/${input.fileNamePrefix}-${Date.now()}-${randomUUID()}${extension}`;
  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent(input.bucket)}/${encodeObjectPath(objectPath)}`,
    {
      body: Buffer.from(await input.file.arrayBuffer()),
      headers: getStorageHeaders({
        "Content-Type": input.file.type,
        "x-upsert": "true",
      }),
      method: "POST",
    },
  );

  if (!uploadResponse.ok) {
    throw new Error(
      `Unable to upload image: ${await readErrorMessage(uploadResponse)}`,
    );
  }

  return {
    objectPath,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(input.bucket)}/${encodeObjectPath(objectPath)}`,
  };
}

export async function uploadProfileImage(userId: number, file: File) {
  return uploadPublicFile({
    bucket: getProfileImageBucket(),
    directory: "avatars",
    file,
    allowedTypes: IMAGE_ALLOWED_TYPES,
    fileNamePrefix: `user-${userId}`,
    fileSizeLimitBytes: 2 * 1024 * 1024,
  });
}

export async function uploadTrainingVideo(userId: number, file: File) {
  return uploadPublicFile({
    bucket: getTrainingVideoBucket(),
    directory: "training-videos",
    file,
    allowedTypes: VIDEO_ALLOWED_TYPES,
    fileNamePrefix: `admin-${userId}`,
    fileSizeLimitBytes: 50 * 1024 * 1024,
  });
}

export async function removePublicFile(input: {
  bucket: string;
  publicUrl: string | null | undefined;
}) {
  const { publicUrl } = input;

  if (!publicUrl) {
    return;
  }

  const supabaseUrl = getSupabaseUrl();
  const publicPrefix = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(input.bucket)}/`;

  if (!publicUrl.startsWith(publicPrefix)) {
    return;
  }

  const objectPath = decodeURIComponent(publicUrl.slice(publicPrefix.length));
  const deleteResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent(input.bucket)}/${encodeObjectPath(objectPath)}`,
    {
      headers: getStorageHeaders(),
      method: "DELETE",
    },
  );

  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    throw new Error(
      `Unable to remove previous image: ${await readErrorMessage(deleteResponse)}`,
    );
  }
}

export async function removeProfileImage(publicUrl: string | null | undefined) {
  return removePublicFile({
    bucket: getProfileImageBucket(),
    publicUrl,
  });
}
