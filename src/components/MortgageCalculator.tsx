'use client';

import React, { useState, useMemo } from 'react';
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
  formatCurrency, 
  formatNumber,
  LoanInput,
  CombinedLoanInput 
} from '@/lib/mortgage-calculator';
import { PaymentChart } from './PaymentChart';
import { PaymentTable } from './PaymentTable';

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

  // 计算结果
  const commercialResult = useMemo(() => 
    calculateMortgage({ ...loanForm, interestRate: 3.0 }), [loanForm]
  );

  const cpfResult = useMemo(() => 
    calculateMortgage({ ...loanForm, interestRate: 2.6 }), [loanForm]
  );

  const combinedResult = useMemo(() => 
    calculateCombinedLoan(combinedForm), [combinedForm]
  );

  const handleLoanFormChange = (field: keyof LoanInput, value: string | number) => {
    setLoanForm(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCombinedFormChange = (field: keyof CombinedLoanInput, value: string | number) => {
    setCombinedForm(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
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
                  value={loanForm.loanAmount}
                  onChange={(e) => handleLoanFormChange('loanAmount', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">年利率（%）</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={activeTab === 'commercial' ? 3.0 : 2.6}
                  onChange={(e) => handleLoanFormChange('interestRate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanTerm">贷款期限（年）</Label>
                <Select
                  value={loanForm.loanTerm.toString()}
                  onValueChange={(value) => handleLoanFormChange('loanTerm', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                    <SelectValue />
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
                value={combinedForm.commercialAmount}
                onChange={(e) => handleCombinedFormChange('commercialAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commercialRate">商贷利率（%）</Label>
              <Input
                id="commercialRate"
                type="number"
                step="0.01"
                value={combinedForm.commercialRate}
                onChange={(e) => handleCombinedFormChange('commercialRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfAmount">公积金贷款金额（元）</Label>
              <Input
                id="cpfAmount"
                type="number"
                value={combinedForm.cpfAmount}
                onChange={(e) => handleCombinedFormChange('cpfAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpfRate">公积金利率（%）</Label>
              <Input
                id="cpfRate"
                type="number"
                step="0.01"
                value={combinedForm.cpfRate}
                onChange={(e) => handleCombinedFormChange('cpfRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="combinedLoanTerm">贷款期限（年）</Label>
              <Select
                value={combinedForm.loanTerm.toString()}
                onValueChange={(value) => handleCombinedFormChange('loanTerm', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
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
                  <SelectValue />
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

          <Card>
            <CardHeader>
              <CardTitle>还款明细表</CardTitle>
              <CardDescription>详细的月度还款计划</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable data={commercialResult.monthlyPayments} />
            </CardContent>
          </Card>
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

          <Card>
            <CardHeader>
              <CardTitle>还款明细表</CardTitle>
              <CardDescription>详细的月度还款计划</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable data={cpfResult.monthlyPayments} />
            </CardContent>
          </Card>
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

          <Card>
            <CardHeader>
              <CardTitle>组合贷款还款明细表</CardTitle>
              <CardDescription>详细的月度还款计划（商贷+公积金）</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable data={combinedResult.combined.monthlyPayments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
