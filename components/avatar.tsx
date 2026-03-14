import Image from "next/image";

type AvatarProps = {
  name: string;
  profileImageUrl?: string | null;
  size?: "sm" | "md";
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, profileImageUrl, size = "md" }: AvatarProps) {
  const initials = getInitials(name);
  const dimensions = size === "sm" ? "h-9 w-9 text-sm" : "h-10 w-10 text-sm";
  const pixelSize = size === "sm" ? 36 : 40;

  if (profileImageUrl) {
    return (
      <Image
        alt={`${name} profile`}
        className={`${dimensions} rounded-full border border-[var(--border)] bg-[var(--panel)] object-cover`}
        height={pixelSize}
        src={profileImageUrl}
        unoptimized
        width={pixelSize}
      />
    );
  }

  return (
    <div
      className={`${dimensions} flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] font-semibold text-[var(--foreground)]`}
    >
      {initials}
    </div>
  );
}
