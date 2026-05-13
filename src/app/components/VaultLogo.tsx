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
        fill="#E2E2DA"
        stroke="#0A0A0A"
        strokeWidth="2.6"
      />
      <rect
        x="12"
        y="16"
        width="40"
        height="36"
        rx="2"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="1.4"
        opacity="0.55"
      />
      <circle
        cx="32"
        cy="34"
        r="11"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="2.6"
      />
      <circle cx="32" cy="34" r="3.4" fill="#F64618" />
      <line
        x1="32"
        y1="34"
        x2="32"
        y2="20"
        stroke="#0A0A0A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="34"
        x2="42"
        y2="42"
        stroke="#0A0A0A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="56" r="1.6" fill="#0A0A0A" />
      <circle cx="50" cy="56" r="1.6" fill="#0A0A0A" />
    </svg>
  );
}
