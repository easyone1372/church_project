"use client";

import { CATEGORIES } from "@/data/Categories";

interface CategoryFilterProps {
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export default function CategoryFilter({ selected, onToggle }: CategoryFilterProps) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-text-heading mb-3">카테고리</h3>
      <ul className="flex flex-col gap-1">
        {CATEGORIES.map((cat) => {
          const isSelected = cat.id === "all" ? selected.size === 0 : selected.has(cat.id);
          return (
            <li key={cat.id}>
              <button
                onClick={() => onToggle(cat.id)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[14px] transition-colors text-left cursor-pointer border-none bg-transparent ${
                  isSelected ? "text-brand font-semibold" : "text-text-body hover:text-brand"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  isSelected ? "border-brand" : "border-[#d1d5db]"
                }`}>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-brand block" />}
                </span>
                {cat.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
