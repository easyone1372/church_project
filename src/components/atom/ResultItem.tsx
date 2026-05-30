interface ResultItemProps {
  title: string;
  category: string;
  location: string;
  timeAgo: string;
  price: string;
  imageEmoji: string;
  imageUrl?: string;
  onClick?: () => void;
}

export default function ResultItem({
  title,
  category,
  location,
  timeAgo,
  price,
  imageEmoji,
  imageUrl,
  onClick,
}: ResultItemProps) {
  return (
    <div onClick={onClick} className="flex gap-4 p-4 rounded-2xl hover:bg-surface-card transition-colors cursor-pointer border border-transparent hover:border-border-card group">
      {/* 썸네일 */}
      <div className="w-30 h-30 shrink-0 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-5xl overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          imageEmoji
        )}
      </div>

      {/* 내용 */}
      <div className="flex flex-col justify-between flex-1 py-1">
        <div>
          <span className="inline-block mb-1 text-[11px] font-semibold text-brand bg-brand-bg px-2 py-0.5 rounded-full">
            {category}
          </span>
          <h3 className="mt-1 text-[15px] font-semibold text-text-heading leading-snug group-hover:text-brand transition-colors">
            {title}
          </h3>
        </div>
        <div>
          <p className="text-[20px] font-bold text-text-heading">{price}</p>
          <p className="text-[12px] text-text-muted mt-0.5">
            {location} · {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
