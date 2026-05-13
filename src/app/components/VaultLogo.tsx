type Props = {
  size?: number;
  className?: string;
};

export default function VaultLogo({ size = 28, className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect
        x="6"
        y="10"
        width="52"
        height="48"
        rx="3"
        fill="#14141B"
        stroke="#E0B65A"
        strokeWidth="2.6"
      />
      <rect
        x="12"
        y="16"
        width="40"
        height="36"
        rx="2"
        fill="none"
        stroke="#E0B65A"
        strokeWidth="1.4"
        opacity="0.55"
      />
      <circle
        cx="32"
        cy="34"
        r="11"
        fill="none"
        stroke="#E0B65A"
        strokeWidth="2.6"
      />
      <circle cx="32" cy="34" r="3.4" fill="#E0B65A" />
      <line
        x1="32"
        y1="34"
        x2="32"
        y2="20"
        stroke="#E0B65A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="34"
        x2="42"
        y2="42"
        stroke="#E0B65A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="56" r="1.6" fill="#E0B65A" />
      <circle cx="50" cy="56" r="1.6" fill="#E0B65A" />
    </svg>
  );
}
