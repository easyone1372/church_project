import Link from "next/link";
import Logo from "@/components/atom/Logo";
import NavLink from "@/components/atom/NavLink";
import RpButton from "@/components/atom/RpButton";

const NAV_LINKS = [
  { href: "/musicmap", label: "음악맵", disabled: false },
  { href: "/community", label: "커뮤니티", disabled: true },
];

interface HeaderProps {
  onLogoClick?: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header
      className="px-10 flex items-center justify-between border-b border-border-header"
      style={{ height: "60px" }}
    >
      <Logo onClick={onLogoClick} />
      <nav className="flex items-center gap-8">
        {NAV_LINKS.map((link) =>
          link.disabled ? (
            <div key={link.label} className="relative flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-semibold text-brand leading-none">개발중</span>
              <span className="text-sm text-text-muted cursor-not-allowed">{link.label}</span>
            </div>
          ) : (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ),
        )}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
          title="내 정보"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand hover:text-white">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
        <RpButton variant="primary">시작하기</RpButton>
      </nav>
    </header>
  );
}
