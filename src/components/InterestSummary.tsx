'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar } from 'lucide-react';
import { 
  YearlyInterestSummary, 
  formatCurrency, 
  formatNumber 
} from '@/lib/mortgage-calculator';

interface InterestSummaryProps {
  data: YearlyInterestSummary[];
  title?: string;
}

export function InterestSummary({ data, title = "前5年利息统计" }: InterestSummaryProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((yearData) => (
            <div key={yearData.year} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">第{yearData.year}年</span>
                  <Badge variant="outline" className="text-xs">
                    累积
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    {formatCurrency(yearData.cumulativeInterest)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    当年: {formatCurrency(yearData.yearlyInterest)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>占总利息比例</span>
                  <span className="font-medium">
                    {formatNumber(yearData.interestPercentage)}%
                  </span>
                </div>
                <Progress 
                  value={yearData.interestPercentage} 
                  className="h-2"
                />
              </div>
              
              {yearData.year < data.length && (
                <div className="border-b border-gray-100 pb-2" />
              )}
            </div>
          ))}
          
          {/* 统计摘要 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3 text-gray-800">关键洞察</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">前3年累积利息:</span>
                <span className="font-medium text-orange-600">
                  {data[2] ? formatCurrency(data[2].cumulativeInterest) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">前3年利息占比:</span>
                <span className="font-medium text-orange-600">
                  {data[2] ? `${formatNumber(data[2].interestPercentage)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">前5年累积利息:</span>
                <span className="font-medium text-red-600">
                  {data[4] ? formatCurrency(data[4].cumulativeInterest) : 
                   data[data.length - 1] ? formatCurrency(data[data.length - 1].cumulativeInterest) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">前5年利息占比:</span>
                <span className="font-medium text-red-600">
                  {data[4] ? `${formatNumber(data[4].interestPercentage)}%` : 
                   data[data.length - 1] ? `${formatNumber(data[data.length - 1].interestPercentage)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
