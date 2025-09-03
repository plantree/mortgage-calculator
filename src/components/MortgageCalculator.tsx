'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Home, PiggyBank, Combine } from 'lucide-react';
import { 
  calculateMortgage, 
  calculateCombinedLoan, 
  calculateYearlyInterestSummary,
  formatCurrency, 
  formatNumber,
  LoanInput,
  CombinedLoanInput 
} from '@/lib/mortgage-calculator';
import { PaymentChart } from './PaymentChart';
import { PaymentTable } from './PaymentTable';
import { InterestSummary } from './InterestSummary';
import { EarlyRepaymentCalculator } from './EarlyRepaymentCalculator';

export function MortgageCalculator() {
  // 单一贷款表单状态
  const [loanForm, setLoanForm] = useState<LoanInput>({
    loanAmount: 1000000,
    interestRate: 3.0,
    loanTerm: 30,
    paymentMethod: 'equalInstallment'
  });

  // 组合贷款表单状态
  const [combinedForm, setCombinedForm] = useState<CombinedLoanInput>({
    commercialAmount: 800000,
    commercialRate: 3.0,
    cpfAmount: 600000,
    cpfRate: 2.6,
    loanTerm: 30,
    paymentMethod: 'equalInstallment'
  });

  const [activeTab, setActiveTab] = useState('commercial');

  // 当切换标签页时，更新利率为默认值
  useEffect(() => {
    if (activeTab === 'commercial') {
      setLoanForm(prev => ({ ...prev, interestRate: 3.0 }));
    } else if (activeTab === 'cpf') {
      setLoanForm(prev => ({ ...prev, interestRate: 2.6 }));
    }
  }, [activeTab]);

  // 计算结果
  const commercialResult = useMemo(() => 
    calculateMortgage({ 
      ...loanForm, 
      interestRate: activeTab === 'commercial' ? loanForm.interestRate : 3.0 
    }), [loanForm, activeTab]
  );

  const cpfResult = useMemo(() => 
    calculateMortgage({ 
      ...loanForm, 
      interestRate: activeTab === 'cpf' ? loanForm.interestRate : 2.6 
    }), [loanForm, activeTab]
  );

  const combinedResult = useMemo(() => 
    calculateCombinedLoan(combinedForm), [combinedForm]
  );

  // 计算年度利息统计
  const commercialYearlyStats = useMemo(() => 
    calculateYearlyInterestSummary(commercialResult.monthlyPayments, commercialResult.totalInterest), 
    [commercialResult]
  );

  const cpfYearlyStats = useMemo(() => 
    calculateYearlyInterestSummary(cpfResult.monthlyPayments, cpfResult.totalInterest), 
    [cpfResult]
  );

  const combinedYearlyStats = useMemo(() => 
    calculateYearlyInterestSummary(combinedResult.combined.monthlyPayments, combinedResult.combined.totalInterest), 
    [combinedResult]
  );

  const handleLoanFormChange = (field: keyof LoanInput, value: string | number) => {
    if (field === 'paymentMethod') {
      setLoanForm(prev => ({ ...prev, [field]: value as LoanInput['paymentMethod'] }));
    } else {
      // 对于数字字段，立即解析为数字，避免前导零问题
      const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      setLoanForm(prev => ({ ...prev, [field]: numericValue as number }));
    }
  };

  const handleCombinedFormChange = (field: keyof CombinedLoanInput, value: string | number) => {
    if (field === 'paymentMethod') {
      setCombinedForm(prev => ({ ...prev, [field]: value as CombinedLoanInput['paymentMethod'] }));
    } else {
      // 对于数字字段，立即解析为数字，避免前导零问题
      const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      setCombinedForm(prev => ({ ...prev, [field]: numericValue as number }));
    }
  };

  const renderSummaryCard = (title: string, result: { totalInterest: number; totalPayment: number; firstMonthPayment: number; lastMonthPayment: number }, icon: React.ReactNode) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">总利息：</span>
            <span className="font-medium text-red-600">{formatCurrency(result.totalInterest)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">总还款：</span>
            <span className="font-medium">{formatCurrency(result.totalPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">首月还款：</span>
            <span className="font-medium text-blue-600">{formatCurrency(result.firstMonthPayment)}</span>
          </div>
          {result.lastMonthPayment !== result.firstMonthPayment && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">末月还款：</span>
              <span className="font-medium text-green-600">{formatCurrency(result.lastMonthPayment)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderInputForm = (type: 'single' | 'combined') => {
    if (type === 'single') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              贷款信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">贷款金额（元）</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={loanForm.loanAmount === 0 ? '' : loanForm.loanAmount}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // 如果输入为空或只有前导零，保持原样让用户继续输入
                    if (inputValue === '' || inputValue === '0') {
                      handleLoanFormChange('loanAmount', inputValue);
                    } else {
                      // 立即解析并格式化数字，去除前导零
                      const numValue = parseFloat(inputValue) || 0;
                      handleLoanFormChange('loanAmount', numValue);
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">年利率（%）</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={loanForm.interestRate === 0 ? '' : loanForm.interestRate}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // 如果输入为空或只有前导零，保持原样让用户继续输入
                    if (inputValue === '' || inputValue === '0' || inputValue === '0.') {
                      handleLoanFormChange('interestRate', inputValue);
                    } else {
                      // 立即解析并格式化数字，去除前导零
                      const numValue = parseFloat(inputValue) || 0;
                      handleLoanFormChange('interestRate', numValue);
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanTerm">贷款期限（年）</Label>
                <Select
                  value={loanForm.loanTerm.toString()}
                  onValueChange={(value) => handleLoanFormChange('loanTerm', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {loanForm.loanTerm ? `${loanForm.loanTerm}年` : '请选择贷款期限'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10年</SelectItem>
                    <SelectItem value="15">15年</SelectItem>
                    <SelectItem value="20">20年</SelectItem>
                    <SelectItem value="25">25年</SelectItem>
                    <SelectItem value="30">30年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">还款方式</Label>
                <Select
                  value={loanForm.paymentMethod}
                  onValueChange={(value) => handleLoanFormChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {loanForm.paymentMethod === 'equalInstallment' ? '等额本息' : 
                       loanForm.paymentMethod === 'equalPrincipal' ? '等额本金' : '请选择还款方式'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equalInstallment">等额本息</SelectItem>
                    <SelectItem value="equalPrincipal">等额本金</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Combine className="h-5 w-5" />
            组合贷款信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commercialAmount">商贷金额（元）</Label>
              <Input
                id="commercialAmount"
                type="number"
                value={combinedForm.commercialAmount === 0 ? '' : combinedForm.commercialAmount}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '' || inputValue === '0') {
                    handleCombinedFormChange('commercialAmount', inputValue);
                  } else {
                    const numValue = parseFloat(inputValue) || 0;
                    handleCombinedFormChange('commercialAmount', numValue);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commercialRate">商贷利率（%）</Label>
              <Input
                id="commercialRate"
                type="number"
                step="0.01"
                value={combinedForm.commercialRate === 0 ? '' : combinedForm.commercialRate}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '' || inputValue === '0' || inputValue === '0.') {
                    handleCombinedFormChange('commercialRate', inputValue);
                  } else {
                    const numValue = parseFloat(inputValue) || 0;
                    handleCombinedFormChange('commercialRate', numValue);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfAmount">公积金贷款金额（元）</Label>
              <Input
                id="cpfAmount"
                type="number"
                value={combinedForm.cpfAmount === 0 ? '' : combinedForm.cpfAmount}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '' || inputValue === '0') {
                    handleCombinedFormChange('cpfAmount', inputValue);
                  } else {
                    const numValue = parseFloat(inputValue) || 0;
                    handleCombinedFormChange('cpfAmount', numValue);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfRate">公积金利率（%）</Label>
              <Input
                id="cpfRate"
                type="number"
                step="0.01"
                value={combinedForm.cpfRate === 0 ? '' : combinedForm.cpfRate}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '' || inputValue === '0' || inputValue === '0.') {
                    handleCombinedFormChange('cpfRate', inputValue);
                  } else {
                    const numValue = parseFloat(inputValue) || 0;
                    handleCombinedFormChange('cpfRate', numValue);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="combinedLoanTerm">贷款期限（年）</Label>
                <Select
                  value={combinedForm.loanTerm.toString()}
                  onValueChange={(value) => handleCombinedFormChange('loanTerm', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {combinedForm.loanTerm ? `${combinedForm.loanTerm}年` : '请选择贷款期限'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10年</SelectItem>
                    <SelectItem value="15">15年</SelectItem>
                    <SelectItem value="20">20年</SelectItem>
                    <SelectItem value="25">25年</SelectItem>
                    <SelectItem value="30">30年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="combinedPaymentMethod">还款方式</Label>
                <Select
                  value={combinedForm.paymentMethod}
                  onValueChange={(value) => handleCombinedFormChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {combinedForm.paymentMethod === 'equalInstallment' ? '等额本息' : 
                       combinedForm.paymentMethod === 'equalPrincipal' ? '等额本金' : '请选择还款方式'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equalInstallment">等额本息</SelectItem>
                    <SelectItem value="equalPrincipal">等额本金</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">房贷计算器</h1>
        <p className="text-muted-foreground">精确计算您的房贷还款计划</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commercial" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            商业贷款
          </TabsTrigger>
          <TabsTrigger value="cpf" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            公积金贷款
          </TabsTrigger>
          <TabsTrigger value="combined" className="flex items-center gap-2">
            <Combine className="h-4 w-4" />
            组合贷款
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commercial" className="space-y-6">
          {renderInputForm('single')}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderSummaryCard('商业贷款', commercialResult, <Home className="h-4 w-4 text-muted-foreground" />)}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  还款趋势图
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentChart data={commercialResult.monthlyPayments} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InterestSummary data={commercialYearlyStats} title="商业贷款前5年利息统计" />
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>还款明细表</CardTitle>
                <CardDescription>详细的月度还款计划</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentTable data={commercialResult.monthlyPayments} />
              </CardContent>
            </Card>
          </div>

          <EarlyRepaymentCalculator 
            originalLoan={loanForm} 
            originalResult={commercialResult} 
          />
        </TabsContent>

        <TabsContent value="cpf" className="space-y-6">
          {renderInputForm('single')}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderSummaryCard('公积金贷款', cpfResult, <PiggyBank className="h-4 w-4 text-muted-foreground" />)}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  还款趋势图
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentChart data={cpfResult.monthlyPayments} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InterestSummary data={cpfYearlyStats} title="公积金贷款前5年利息统计" />
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>还款明细表</CardTitle>
                <CardDescription>详细的月度还款计划</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentTable data={cpfResult.monthlyPayments} />
              </CardContent>
            </Card>
          </div>

          <EarlyRepaymentCalculator 
            originalLoan={loanForm} 
            originalResult={cpfResult} 
          />
        </TabsContent>

        <TabsContent value="combined" className="space-y-6">
          {renderInputForm('combined')}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {renderSummaryCard('商业贷款', combinedResult.commercial, <Home className="h-4 w-4 text-muted-foreground" />)}
            {renderSummaryCard('公积金贷款', combinedResult.cpf, <PiggyBank className="h-4 w-4 text-muted-foreground" />)}
            {renderSummaryCard('组合总计', combinedResult.combined, <Combine className="h-4 w-4 text-muted-foreground" />)}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总贷款金额</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(combinedForm.commercialAmount + combinedForm.cpfAmount)}
                </div>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">商贷</Badge>
                    <span className="text-sm">{formatNumber(combinedForm.commercialAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">公积金</Badge>
                    <span className="text-sm">{formatNumber(combinedForm.cpfAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                组合贷款还款趋势图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentChart data={combinedResult.combined.monthlyPayments} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InterestSummary data={combinedYearlyStats} title="组合贷款前5年利息统计" />
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>组合贷款还款明细表</CardTitle>
                <CardDescription>详细的月度还款计划（商贷+公积金）</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentTable data={combinedResult.combined.monthlyPayments} />
              </CardContent>
            </Card>
          </div>

          <EarlyRepaymentCalculator 
            originalLoan={{
              loanAmount: combinedForm.commercialAmount + combinedForm.cpfAmount,
              interestRate: (combinedForm.commercialRate * combinedForm.commercialAmount + combinedForm.cpfRate * combinedForm.cpfAmount) / (combinedForm.commercialAmount + combinedForm.cpfAmount),
              loanTerm: combinedForm.loanTerm,
              paymentMethod: combinedForm.paymentMethod
            }} 
            originalResult={combinedResult.combined}
            combinedLoanInfo={{
              commercialAmount: combinedForm.commercialAmount,
              commercialRate: combinedForm.commercialRate,
              cpfAmount: combinedForm.cpfAmount,
              cpfRate: combinedForm.cpfRate
            }}
          />
        </TabsContent>
      </Tabs>
      
      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center text-sm text-muted-foreground">
          Copyright © from 2025 <a href="https://plantree.me" className="hover:underline">Plantree</a>. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
