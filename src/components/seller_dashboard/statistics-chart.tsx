interface StatisticsChartProps {
  getLast7DaysRange: () => string;
}

export function StatisticsChart({ getLast7DaysRange }: StatisticsChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Your shop statistic
      </h2>
      <p className="text-gray-600 mb-4">{getLast7DaysRange()}</p>
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <div className="text-lg font-medium">Chart Placeholder</div>
          <div className="text-sm">Sales statistics will appear here</div>
        </div>
      </div>
    </div>
  );
}
