import Button from "@/components/atom/Button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  return (
    <div
      className="w-full mx-auto h-16 px-5 bg-white border border-border-base rounded-full shadow-search flex items-center gap-3"
      style={{ maxWidth: "var(--max-w-search)" }}
    >
      <div className="shrink-0 pr-4 border-r border-border-divider text-base font-bold text-brand">
        ✦ AI 검색
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        placeholder="AI에게 원하는 음악 서비스나 레슨을 물어보세요"
        className="flex-1 border-none outline-none text-base text-text-body bg-transparent placeholder-text-placeholder"
      />
      <button className="border-none bg-transparent text-lg cursor-pointer">
        🎙️
      </button>
      <Button variant="round" onClick={onSearch}>
        →
      </Button>
    </div>
  );
}
