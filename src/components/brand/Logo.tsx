type LogoProps = {
  size?: number;
  color?: string;
  accent?: string;
  title?: string;
  className?: string;
};

/** Primary mark — sprout under shelter (design handoff). */
export function LogoPermaBrella({
  size = 48,
  color = "var(--pb-primary)",
  accent = "var(--pb-accent-2)",
  title = "PermaBrella",
  className,
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <path
        d="M 12 46 Q 48 12 84 46"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="48" cy="18" r="3.2" fill={color} />
      <line
        x1="48"
        y1="46"
        x2="48"
        y2="78"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M 48 64 Q 36 60 32 48"
        stroke={accent}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 48 56 Q 60 52 64 40"
        stroke={accent}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="48" cy="46" r="3.2" fill={accent} />
    </svg>
  );
}
