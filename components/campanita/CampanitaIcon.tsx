import { cn } from "@/lib/utils";

export function CampanitaIcon({
  className,
  imageClassName,
  priority = false
}: {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#f9ead2] shadow-soft",
        className
      )}
    >
      <img
        src="/icons/icon-192.png"
        alt=""
        width={192}
        height={192}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </span>
  );
}
