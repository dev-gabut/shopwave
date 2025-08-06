interface StatCardProps {
  title: string;
  count: number;
  bgColor?: string;
}

export function StatCard({
  title,
  count,
  bgColor = 'bg-gray-200',
}: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-center`}>
      <div className="text-xs font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{count}</div>
    </div>
  );
}
