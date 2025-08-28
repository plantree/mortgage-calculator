'use client';

import React, { useState } from 'react';
import { MonthlyPayment, formatCurrency } from '@/lib/mortgage-calculator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaymentTableProps {
  data: MonthlyPayment[];
}

export function PaymentTable({ data }: PaymentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 显示12个月的数据
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const currentData = getCurrentPageData();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">期数</th>
              <th className="text-right p-3 font-medium">月供总额</th>
              <th className="text-right p-3 font-medium">本金</th>
              <th className="text-right p-3 font-medium">利息</th>
              <th className="text-right p-3 font-medium">剩余本金</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((payment) => (
              <tr key={payment.month} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{payment.month}</td>
                <td className="p-3 text-right font-medium">
                  {formatCurrency(payment.totalPayment)}
                </td>
                <td className="p-3 text-right text-blue-600">
                  {formatCurrency(payment.principal)}
                </td>
                <td className="p-3 text-right text-red-600">
                  {formatCurrency(payment.interest)}
                </td>
                <td className="p-3 text-right text-green-600">
                  {formatCurrency(payment.remainingPrincipal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          显示第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, data.length)} 期，
          共 {data.length} 期
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
