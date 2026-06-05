import Link from "next/link";

interface LogoProps {
  onClick?: () => void;
}

export default function Logo({ onClick }: LogoProps) {
  return (
    <Link
      href={"/"}
      className="flex flex-col leading-none cursor-pointer"
      onClick={onClick}
    >
      <strong
        className="text-[22px] font-black tracking-widest"
        style={{ color: "var(--color-brand)" }}
      >
        REFILL
      </strong>
      <span
        className="text-[10px] tracking-wide"
        style={{ color: "var(--color-text-muted)" }}
      >
        음악을 채우다.
      </span>
    </Link>
  );
}
