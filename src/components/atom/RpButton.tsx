interface RpButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "round";
  className?: string;
}

export default function RpButton({
  onClick,
  children,
  variant = "primary",
  className = "",
}: RpButtonProps) {
  const base =
    "cursor-pointer transition-opacity hover:opacity-80 font-medium border-none";

  const variants = {
    primary: "bg-brand text-white px-[18px] py-2 rounded-full text-2xs",
    round:
      "w-10 h-10 rounded-full bg-brand text-white text-base leading-none flex items-center justify-center",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
