interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function Field({ label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-2xs font-semibold text-text-muted">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
    </div>
  );
}
