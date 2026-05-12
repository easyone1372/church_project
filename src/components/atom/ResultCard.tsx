interface ResultCardProps {
  title: string;
  description: string;
}

export default function ResultCard({ title, description }: ResultCardProps) {
  return (
    <div className="p-5 rounded-card bg-surface-card border border-border-card">
      <strong className="block mb-2.5 text-md text-text-heading">
        {title}
      </strong>
      <p className="m-0 text-text-muted text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
