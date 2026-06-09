import BookmarkButton from "@/components/atom/BookmarkButton";

interface ResultItemProps {
  title: string;
  category: string;
  location: string;
  timeAgo: string;
  price: string;
  imageEmoji: string;
  imageUrl?: string;
  direction?: "offer" | "seek";
  bookmarked?: boolean;
  onBookmark?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

const DIRECTION_BADGE: Record<string, { label: string; color: string }> = {
  offer: { label: "합니다·팝니다", color: "#8F4BC6" },
  seek:  { label: "구합니다·삽니다", color: "#0ea5e9" },
};

export default function ResultItem({
  title,
  category,
  location,
  timeAgo,
  price,
  imageEmoji,
  imageUrl,
  direction,
  bookmarked,
  onBookmark,
  onClick,
}: ResultItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex gap-4 p-4 rounded-2xl hover:bg-surface-card transition-colors cursor-pointer border border-transparent hover:border-border-card group"
    >
      {/* 썸네일 */}
      <div className="w-20 h-20 sm:w-30 sm:h-30 shrink-0 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-3xl sm:text-5xl overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          imageEmoji
        )}
      </div>

      {/* 내용 */}
      <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[11px] font-semibold text-brand bg-brand-bg px-2 py-0.5 rounded-full shrink-0">
              {category}
            </span>
            {direction && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  color: DIRECTION_BADGE[direction].color,
                  background: direction === "offer" ? "#f3e8ff" : "#e0f2fe",
                }}
              >
                {DIRECTION_BADGE[direction].label}
              </span>
            )}
          </div>
          <h3 className="text-[15px] font-semibold text-text-heading leading-snug group-hover:text-brand transition-colors truncate">
            {title}
          </h3>
        </div>
        <div>
          <p className="text-[17px] sm:text-[20px] font-bold text-text-heading">{price}</p>
          <p className="text-[12px] text-text-muted mt-0.5">
            {location} · {timeAgo}
          </p>
        </div>
      </div>

      {/* 북마크 버튼 */}
      {onBookmark !== undefined && (
        <div className="flex items-start pt-1 shrink-0">
          <BookmarkButton bookmarked={bookmarked ?? false} onToggle={onBookmark} />
        </div>
      )}
    </div>
  );
}
