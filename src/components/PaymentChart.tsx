'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MonthlyPayment, formatCurrency } from '@/lib/mortgage-calculator';

interface PaymentChartProps {
  data: MonthlyPayment[];
}

export function PaymentChart({ data }: PaymentChartProps) {
  // 准备图表数据，只显示前120个月（10年）以保持图表可读性
  const chartData = data.slice(0, 120).map(payment => ({
    month: payment.month,
    本金: Math.round(payment.principal),
    利息: Math.round(payment.interest),
    剩余本金: Math.round(payment.remainingPrincipal),
    月供总额: Math.round(payment.totalPayment)
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string | number }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`第 ${label} 个月`}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 月供组成图表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">月供组成趋势（前10年）</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              label={{ value: '月份', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: '金额（元）', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="利息"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="本金"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 剩余本金趋势图 */}
      <div>
        <h3 className="text-lg font-medium mb-4">剩余本金趋势（前10年）</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              label={{ value: '月份', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: '剩余本金（元）', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '剩余本金']}
              labelFormatter={(label) => `第 ${label} 个月`}
            />
            <Area
              type="monotone"
              dataKey="剩余本金"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
