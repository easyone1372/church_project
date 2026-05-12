interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className="text-text-body no-underline hover:text-brand transition-colors text-xs"
    >
      {children}
    </a>
  );
}
