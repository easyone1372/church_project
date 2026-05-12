interface LogoProps {
  onClick?: () => void;
}

export default function Logo({ onClick }: LogoProps) {
  return (
    <div
      className="flex flex-col leading-none cursor-pointer"
      onClick={onClick}
    >
      <strong
        className="text-[20px] tracking-tight1"
        style={{ color: "var(--color-text-heading)" }}
      >
        리필
      </strong>
      <span
        className="mt-1 text-[11px] tracking-wide5"
        style={{ color: "var(--color-brand)" }}
      >
        refill
      </span>
    </div>
  );
}
