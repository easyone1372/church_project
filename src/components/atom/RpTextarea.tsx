interface RpTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function RpTextarea({ className = "", ...props }: RpTextareaProps) {
  return (
    <textarea
      className={`border border-border-base rounded-lg px-3 py-2 text-xs text-text-body outline-none placeholder:text-text-placeholder focus:border-brand transition-colors resize-none ${className}`}
      {...props}
    />
  );
}
