import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "busy";
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-xl",
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-neutral-400",
  busy: "bg-red-500",
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
  showStatus = false,
  status = "offline",
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-block", className)}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={96}
          height={96}
          className={cn(
            "rounded-full object-cover border-2 border-white shadow-sm",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm",
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            statusColors[status],
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3"
          )}
        />
      )}
    </div>
  );
}
