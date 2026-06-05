"use client";

import { WRITE_CATEGORIES } from "@/data/Categories";

interface CategorySelectorProps {
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export default function CategorySelector({
  selected,
  onToggle,
}: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {WRITE_CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onToggle(c.id)}
          className={`px-3 py-1.5 rounded-full text-2xs font-semibold border cursor-pointer transition-colors ${
            selected.has(c.id)
              ? "bg-brand text-white border-brand"
              : "bg-white text-text-muted border-border-base hover:border-brand hover:text-brand"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
