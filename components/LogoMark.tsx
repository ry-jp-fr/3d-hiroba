/**
 * Renders just the swirl motif from /public/logo.png by cropping it via CSS.
 * Motif geometry is hand-tuned for the original 1200×896 logo artwork;
 * update MOTIF_* constants if the source logo changes.
 */
const LOGO_W = 1200;
const LOGO_H = 896;
const MOTIF_CX = 292;
const MOTIF_CY = 448;
const MOTIF_SIZE = 350;

export function LogoMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const scale = size / MOTIF_SIZE;
  const scaledW = LOGO_W * scale;
  const scaledH = LOGO_H * scale;
  const left = size / 2 - MOTIF_CX * scale;
  const top = size / 2 - MOTIF_CY * scale;
  return (
    <span
      aria-hidden
      className={`relative inline-block overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt=""
        style={{
          position: "absolute",
          left: `${left}px`,
          top: `${top}px`,
          width: `${scaledW}px`,
          height: `${scaledH}px`,
          maxWidth: "none",
        }}
      />
    </span>
  );
}
