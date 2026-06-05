interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function FilterChip({
  active,
  onClick,
  children,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border cursor-pointer transition-colors whitespace-nowrap ${
        active
          ? "bg-brand text-white border-brand"
          : "bg-white text-text-muted border-border-base hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}
