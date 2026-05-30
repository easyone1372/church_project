interface RpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function RpInput({ className = "", ...props }: RpInputProps) {
  return (
    <input
      className={`border border-border-base rounded-lg px-3 py-2 text-xs text-text-body outline-none placeholder:text-text-placeholder focus:border-brand transition-colors ${className}`}
      {...props}
    />
  );
}
