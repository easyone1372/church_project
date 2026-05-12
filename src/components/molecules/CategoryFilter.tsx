"use client";

import { CATEGORIES } from "@/data/Categories";

interface CategoryFilterProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-text-heading mb-3">카테고리</h3>
      <ul className="flex flex-col gap-1">
        {CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onChange(cat.id)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[14px] transition-colors text-left cursor-pointer border-none bg-transparent
                ${
                  selected === cat.id
                    ? "text-brand font-semibold"
                    : "text-text-body hover:text-brand"
                }`}
            >
              <span
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                  ${selected === cat.id ? "border-brand" : "border-[#d1d5db]"}`}
              >
                {selected === cat.id && (
                  <span className="w-2 h-2 rounded-full bg-brand block" />
                )}
              </span>
              {cat.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
