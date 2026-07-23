type IconProps = {
  className?: string;
};

export function MarqueeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="3.5"
        y="3.5"
        width="13"
        height="13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="2.5 2"
      />
      <path
        d="M3.5 10H16.5M10 3.5V16.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.35"
      />
    </svg>
  );
}
