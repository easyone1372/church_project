interface BookmarkButtonProps {
  bookmarked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

export default function BookmarkButton({
  bookmarked,
  onToggle,
  size = 20,
  className = "",
}: BookmarkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e);
      }}
      aria-label={bookmarked ? "찜 해제" : "찜하기"}
      className={`flex items-center justify-center border-none bg-transparent cursor-pointer transition-transform active:scale-90 hover:scale-110 p-0 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={bookmarked ? "#8F4BC6" : "none"}
        stroke={bookmarked ? "#8F4BC6" : "#a6adbb"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
