import { getLeverIconUrl } from "../utils";

interface LeverIconProps {
  icon?: string | null;
  size?: number;
  className?: string;
}

/** Renders lever artwork from STAR JSON (`icon` absolute URL). */
export function LeverIcon({
  icon,
  size = 24,
  className = "",
}: Readonly<LeverIconProps>) {
  const src = getLeverIconUrl(icon);
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  );
}
