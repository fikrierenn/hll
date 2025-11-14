'use client';

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  showValues?: boolean;
}

export function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const color = item.color || '#3b82f6';
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Value on top */}
              {showValues && (
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {item.value}
                </div>
              )}
              
              {/* Bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    minHeight: item.value > 0 ? '4px' : '0',
                  }}
                />
              </div>
              
              {/* Label */}
              <div className="text-xs text-gray-600 text-center mt-2 font-medium">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
