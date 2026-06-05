interface InfoFieldProps {
  label: string;
  value: string;
}

export default function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[12px] font-semibold text-text-muted w-14 shrink-0">{label}</span>
      <span className="text-[13px] text-text-body">{value}</span>
    </div>
  );
}
