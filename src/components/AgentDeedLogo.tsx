type Props = {
  size?: number;
  className?: string;
};

// AgentDeed mark — a solid title deed stamped with a wax seal.
// Filled glyph (no outline) so it never clashes with a bordered container.
// The keyhole in the seal = the sealed key only the holder can unwrap.
export default function AgentDeedLogo({ size = 28, className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* solid deed body with a folded corner */}
      <path
        d="M12 6 H38 L54 22 V52 a4 4 0 0 1 -4 4 H16 a4 4 0 0 1 -4 -4 Z"
        fill="#0A0A0A"
      />
      {/* folded corner — bone underside */}
      <path d="M38 6 L54 22 H38 Z" fill="#E2E2DA" />
      {/* metadata lines, knocked out in bone */}
      <line
        x1="18"
        y1="24"
        x2="35"
        y2="24"
        stroke="#E2E2DA"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="30"
        x2="30"
        y2="30"
        stroke="#E2E2DA"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* wax seal, stamped over the lower edge */}
      <circle cx="41" cy="44" r="13" fill="#F64618" />
      <circle
        cx="41"
        cy="44"
        r="9"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="1.4"
        opacity="0.55"
      />
      {/* keyhole, knocked out in bone */}
      <circle cx="41" cy="41" r="3.3" fill="#E2E2DA" />
      <path d="M41 43.6 L38.3 50 H43.7 Z" fill="#E2E2DA" />
    </svg>
  );
}
