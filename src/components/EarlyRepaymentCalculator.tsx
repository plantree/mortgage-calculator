'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { 
  LoanInput, 
  LoanResult, 
  EarlyRepaymentInput, 
  EarlyRepaymentResult,
  calculateEarlyRepayment,
  formatCurrency 
} from '@/lib/mortgage-calculator';

interface CombinedLoanInfo {
  commercialAmount: number;
  commercialRate: number;
  cpfAmount: number;
  cpfRate: number;
}

interface EarlyRepaymentCalculatorProps {
  originalLoan: LoanInput;
  originalResult: LoanResult;
  combinedLoanInfo?: CombinedLoanInfo;
}

export function EarlyRepaymentCalculator({ originalLoan, combinedLoanInfo }: EarlyRepaymentCalculatorProps) {
  const [repaymentForm, setRepaymentForm] = useState({
    repaymentMonth: 12,
    repaymentAmount: 100000,
    repaymentType: 'reduceTime' as 'reduceTime' | 'reduceAmount',
    interestRateOption: 'weighted' as 'weighted' | 'commercial' | 'cpf'
  });

  const [showCalculation, setShowCalculation] = useState(false);

  const earlyRepaymentResult: EarlyRepaymentResult | null = useMemo(() => {
    try {
      if (repaymentForm.repaymentAmount > 0 && repaymentForm.repaymentMonth > 0) {
        // 根据用户选择的利率选项确定使用的利率
        let effectiveInterestRate = originalLoan.interestRate;
        
        if (combinedLoanInfo) {
          switch (repaymentForm.interestRateOption) {
            case 'commercial':
              effectiveInterestRate = combinedLoanInfo.commercialRate;
              break;
            case 'cpf':
              effectiveInterestRate = combinedLoanInfo.cpfRate;
              break;
            case 'weighted':
            default:
              // 加权平均利率（默认）
              effectiveInterestRate = (
                combinedLoanInfo.commercialRate * combinedLoanInfo.commercialAmount + 
                combinedLoanInfo.cpfRate * combinedLoanInfo.cpfAmount
              ) / (combinedLoanInfo.commercialAmount + combinedLoanInfo.cpfAmount);
              break;
          }
        }

        const earlyRepaymentInput: EarlyRepaymentInput = {
          originalLoan: {
            ...originalLoan,
            interestRate: effectiveInterestRate
          },
          ...repaymentForm
        };
        return calculateEarlyRepayment(earlyRepaymentInput);
      }
      return null;
    } catch (error) {
      console.error('提前还贷计算错误:', error);
      return null;
    }
  }, [originalLoan, repaymentForm, combinedLoanInfo]);

  const handleFormChange = (field: string, value: string | number) => {
    setRepaymentForm(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (isNaN(Number(value)) ? value : Number(value)) : value
    }));
  };

  const handleCalculate = () => {
    setShowCalculation(true);
  };

  const handleRecalculate = () => {
    // 计算会自动进行，这里只需要确保显示状态正确
    setShowCalculation(true);
  };

  const handleReset = () => {
    setShowCalculation(false);
    setRepaymentForm({
      repaymentMonth: 12,
      repaymentAmount: 100000,
      repaymentType: 'reduceTime',
      interestRateOption: 'weighted'
    });
  };

  // 生成月份选项（最多到贷款期限的80%）
  const maxRepaymentMonth = Math.floor(originalLoan.loanTerm * 12 * 0.8);
  const monthOptions = Array.from({ length: maxRepaymentMonth }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          提前还贷测算
        </CardTitle>
        <CardDescription>
          计算提前还贷对总利息和还款计划的影响
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 输入表单 */}
        <div className="space-y-4">
          {/* 组合贷款利率选择 */}
          {combinedLoanInfo && (
            <div className="space-y-2">
              <Label htmlFor="interestRateOption">计算利率选择</Label>
              <Select
                value={repaymentForm.interestRateOption}
                onValueChange={(value) => handleFormChange('interestRateOption', value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {repaymentForm.interestRateOption === 'weighted' && '加权平均利率'}
                    {repaymentForm.interestRateOption === 'commercial' && `商贷利率 ${combinedLoanInfo.commercialRate}%`}
                    {repaymentForm.interestRateOption === 'cpf' && `公积金利率 ${combinedLoanInfo.cpfRate}%`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weighted">
                    加权平均利率 ({((combinedLoanInfo.commercialRate * combinedLoanInfo.commercialAmount + 
                    combinedLoanInfo.cpfRate * combinedLoanInfo.cpfAmount) / 
                    (combinedLoanInfo.commercialAmount + combinedLoanInfo.cpfAmount)).toFixed(2)}%)
                  </SelectItem>
                  <SelectItem value="commercial">
                    商贷利率 ({combinedLoanInfo.commercialRate}%)
                  </SelectItem>
                  <SelectItem value="cpf">
                    公积金利率 ({combinedLoanInfo.cpfRate}%)
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                <p>• 加权平均利率：按贷款金额比例计算的综合利率</p>
                <p>• 商贷利率：按商业贷款利率计算（通常更高，节省更多利息）</p>
                <p>• 公积金利率：按公积金贷款利率计算（利率较低）</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repaymentMonth">还贷时间（第几个月）</Label>
              <Select
                value={repaymentForm.repaymentMonth.toString()}
                onValueChange={(value) => handleFormChange('repaymentMonth', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue>{repaymentForm.repaymentMonth}个月</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      第{month}个月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="repaymentAmount">提前还贷金额（元）</Label>
              <Input
                id="repaymentAmount"
                type="number"
                value={repaymentForm.repaymentAmount === 0 ? '' : repaymentForm.repaymentAmount}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '' || inputValue === '0') {
                    handleFormChange('repaymentAmount', inputValue);
                  } else {
                    const numValue = parseFloat(inputValue) || 0;
                    handleFormChange('repaymentAmount', numValue);
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="repaymentType">还贷方式</Label>
              <Select
                value={repaymentForm.repaymentType}
                onValueChange={(value) => handleFormChange('repaymentType', value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {repaymentForm.repaymentType === 'reduceTime' ? '缩短年限' : '减少月供'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reduceTime">缩短年限</SelectItem>
                  <SelectItem value="reduceAmount">减少月供</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button onClick={showCalculation ? handleRecalculate : handleCalculate}>
            <Calculator className="h-4 w-4 mr-2" />
            {showCalculation ? '重新计算' : '开始测算'}
          </Button>
          {showCalculation && (
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          )}
        </div>

        {/* 计算结果 */}
        {showCalculation && earlyRepaymentResult && (
          <div className="space-y-4 border-t pt-6">
            <h4 className="text-lg font-semibold">测算结果</h4>
            
            {/* 对比卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="secondary">原计划</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">总利息：</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(earlyRepaymentResult.original.totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">总还款：</span>
                    <span className="font-medium">
                      {formatCurrency(earlyRepaymentResult.original.totalPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">还款期数：</span>
                    <span className="font-medium">
                      {earlyRepaymentResult.original.monthlyPayments.length}期
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="default">提前还贷后</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">总利息：</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(earlyRepaymentResult.afterRepayment.totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">总还款：</span>
                    <span className="font-medium">
                      {formatCurrency(earlyRepaymentResult.afterRepayment.totalPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">还款期数：</span>
                    <span className="font-medium">
                      {earlyRepaymentResult.afterRepayment.monthlyPayments.length}期
                    </span>
                  </div>
                  {earlyRepaymentResult.newMonthlyPayment && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">新月供：</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(earlyRepaymentResult.newMonthlyPayment)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 节省统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">节省利息</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(earlyRepaymentResult.savedInterest)}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              {earlyRepaymentResult.savedMonths !== undefined && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">节省时间</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {earlyRepaymentResult.savedMonths}个月
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {earlyRepaymentResult.newMonthlyPayment && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-800">月供减少</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(
                            earlyRepaymentResult.original.monthlyPayments[0].totalPayment - 
                            earlyRepaymentResult.newMonthlyPayment
                          )}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">说明：</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 提前还贷金额将在第{repaymentForm.repaymentMonth}个月支付</li>
                <li>• 计算结果基于当前利率保持不变的假设</li>
                <li>• 实际操作时请咨询银行关于提前还贷的手续费等相关费用</li>
                {repaymentForm.repaymentType === 'reduceTime' && (
                  <li>• 缩短年限方式：保持月供不变，减少还款期限</li>
                )}
                {repaymentForm.repaymentType === 'reduceAmount' && (
                  <li>• 减少月供方式：保持还款期限不变，降低月供金额</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
