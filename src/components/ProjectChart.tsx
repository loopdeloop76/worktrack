import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TimeFilterOptions } from './TimeFilter';

interface MonthlyStats {
  month: string;
  count: number;
  total_amount: number;
  avg_amount: number;
}

interface ProjectChartProps {
  filters: TimeFilterOptions;
}

export function ProjectChart({ filters }: ProjectChartProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const fetchMonthlyStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.quarter) params.append('quarter', filters.quarter.toString());
      
      const response = await fetch(`http://localhost:3001/api/projects/stats/monthly?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly stats');
      }
      
      const data = await response.json();
      setMonthlyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyStats();
  }, [filters]);

  const formatChartData = () => {
    return monthlyData.map(item => ({
      month: formatMonthLabel(item.month),
      amount: item.total_amount,
      count: item.count,
      avgAmount: item.avg_amount,
    }));
  };

  const formatMonthLabel = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-amount">
            {`Total: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="tooltip-count">
            {`Paid Projects: ${payload[0].payload.count}`}
          </p>
          <p className="tooltip-avg">
            {`Average: ${formatCurrency(payload[0].payload.avgAmount)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="chart-loading">Loading chart data...</div>;
  }

  if (error) {
    return <div className="chart-error">Error loading chart: {error}</div>;
  }

  if (monthlyData.length === 0) {
    return <div className="chart-empty">No paid projects found for the selected time period.</div>;
  }

  const chartData = formatChartData();

  return (
    <div className="project-chart">
      <div className="chart-header">
        <h3>Paid Revenue by Month</h3>
        <div className="chart-controls">
          <label>
            Chart Type:
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </label>
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#007bff" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#007bff" 
                strokeWidth={3}
                dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}