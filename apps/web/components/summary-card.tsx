import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  value?: number;
  description?: string;
  isLoading: boolean;
}

export function SummaryCard({ title, icon, value, description, isLoading }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {icon}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <span className="text-3xl font-bold">{value ?? '—'}</span>
        )}
      </CardContent>
    </Card>
  );
}
