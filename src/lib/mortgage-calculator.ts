// 房贷计算工具函数

export interface LoanInput {
  loanAmount: number; // 贷款金额
  interestRate: number; // 年利率（百分比）
  loanTerm: number; // 贷款期限（年）
  paymentMethod: 'equalInstallment' | 'equalPrincipal'; // 还款方式
}

export interface MonthlyPayment {
  month: number; // 期数
  totalPayment: number; // 月供总额
  principal: number; // 本金
  interest: number; // 利息
  remainingPrincipal: number; // 剩余本金
}

export interface LoanResult {
  monthlyPayments: MonthlyPayment[];
  totalInterest: number; // 总利息
  totalPayment: number; // 总还款额
  firstMonthPayment: number; // 首月还款额
  lastMonthPayment: number; // 末月还款额（等额本金时有用）
}

// 等额本息计算
export function calculateEqualInstallment(input: LoanInput): LoanResult {
  const { loanAmount, interestRate, loanTerm } = input;
  const monthlyRate = interestRate / 100 / 12; // 月利率
  const totalMonths = loanTerm * 12; // 总期数
  
  // 月供计算公式: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  const monthlyPayments: MonthlyPayment[] = [];
  let remainingPrincipal = loanAmount;
  
  for (let month = 1; month <= totalMonths; month++) {
    const interest = remainingPrincipal * monthlyRate;
    const principal = monthlyPayment - interest;
    remainingPrincipal -= principal;
    
    monthlyPayments.push({
      month,
      totalPayment: monthlyPayment,
      principal,
      interest,
      remainingPrincipal: Math.max(0, remainingPrincipal)
    });
  }
  
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;
  
  return {
    monthlyPayments,
    totalInterest,
    totalPayment,
    firstMonthPayment: monthlyPayment,
    lastMonthPayment: monthlyPayment
  };
}

// 等额本金计算
export function calculateEqualPrincipal(input: LoanInput): LoanResult {
  const { loanAmount, interestRate, loanTerm } = input;
  const monthlyRate = interestRate / 100 / 12; // 月利率
  const totalMonths = loanTerm * 12; // 总期数
  const monthlyPrincipal = loanAmount / totalMonths; // 每月还本金
  
  const monthlyPayments: MonthlyPayment[] = [];
  let remainingPrincipal = loanAmount;
  let totalPayment = 0;
  
  for (let month = 1; month <= totalMonths; month++) {
    const interest = remainingPrincipal * monthlyRate;
    const totalMonthlyPayment = monthlyPrincipal + interest;
    remainingPrincipal -= monthlyPrincipal;
    totalPayment += totalMonthlyPayment;
    
    monthlyPayments.push({
      month,
      totalPayment: totalMonthlyPayment,
      principal: monthlyPrincipal,
      interest,
      remainingPrincipal: Math.max(0, remainingPrincipal)
    });
  }
  
  const totalInterest = totalPayment - loanAmount;
  const firstMonthPayment = monthlyPayments[0].totalPayment;
  const lastMonthPayment = monthlyPayments[totalMonths - 1].totalPayment;
  
  return {
    monthlyPayments,
    totalInterest,
    totalPayment,
    firstMonthPayment,
    lastMonthPayment
  };
}

// 主计算函数
export function calculateMortgage(input: LoanInput): LoanResult {
  if (input.paymentMethod === 'equalInstallment') {
    return calculateEqualInstallment(input);
  } else {
    return calculateEqualPrincipal(input);
  }
}

// 组合贷计算
export interface CombinedLoanInput {
  commercialAmount: number; // 商贷金额
  commercialRate: number; // 商贷利率
  cpfAmount: number; // 公积金贷款金额
  cpfRate: number; // 公积金贷款利率
  loanTerm: number; // 贷款期限
  paymentMethod: 'equalInstallment' | 'equalPrincipal';
}

export interface CombinedLoanResult {
  commercial: LoanResult;
  cpf: LoanResult;
  combined: {
    monthlyPayments: MonthlyPayment[];
    totalInterest: number;
    totalPayment: number;
    firstMonthPayment: number;
    lastMonthPayment: number;
  };
}

export function calculateCombinedLoan(input: CombinedLoanInput): CombinedLoanResult {
  const commercialResult = calculateMortgage({
    loanAmount: input.commercialAmount,
    interestRate: input.commercialRate,
    loanTerm: input.loanTerm,
    paymentMethod: input.paymentMethod
  });
  
  const cpfResult = calculateMortgage({
    loanAmount: input.cpfAmount,
    interestRate: input.cpfRate,
    loanTerm: input.loanTerm,
    paymentMethod: input.paymentMethod
  });
  
  // 合并月供数据
  const totalMonths = input.loanTerm * 12;
  const combinedPayments: MonthlyPayment[] = [];
  
  for (let month = 1; month <= totalMonths; month++) {
    const commercialPayment = commercialResult.monthlyPayments[month - 1];
    const cpfPayment = cpfResult.monthlyPayments[month - 1];
    
    combinedPayments.push({
      month,
      totalPayment: commercialPayment.totalPayment + cpfPayment.totalPayment,
      principal: commercialPayment.principal + cpfPayment.principal,
      interest: commercialPayment.interest + cpfPayment.interest,
      remainingPrincipal: commercialPayment.remainingPrincipal + cpfPayment.remainingPrincipal
    });
  }
  
  return {
    commercial: commercialResult,
    cpf: cpfResult,
    combined: {
      monthlyPayments: combinedPayments,
      totalInterest: commercialResult.totalInterest + cpfResult.totalInterest,
      totalPayment: commercialResult.totalPayment + cpfResult.totalPayment,
      firstMonthPayment: commercialResult.firstMonthPayment + cpfResult.firstMonthPayment,
      lastMonthPayment: commercialResult.lastMonthPayment + cpfResult.lastMonthPayment
    }
  };
}

// 格式化金额显示
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// 格式化数字显示（不带货币符号）
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// 计算累积利息统计
export interface YearlyInterestSummary {
  year: number;
  cumulativeInterest: number; // 累积利息
  interestPercentage: number; // 占总利息的比例
  yearlyInterest: number; // 当年利息
}

export function calculateYearlyInterestSummary(monthlyPayments: MonthlyPayment[], totalInterest: number): YearlyInterestSummary[] {
  const yearlyData: YearlyInterestSummary[] = [];
  let cumulativeInterest = 0;
  
  for (let year = 1; year <= 5; year++) {
    const startMonth = (year - 1) * 12 + 1;
    const endMonth = Math.min(year * 12, monthlyPayments.length);
    
    let yearlyInterest = 0;
    
    // 计算该年度的利息
    for (let month = startMonth; month <= endMonth; month++) {
      if (monthlyPayments[month - 1]) {
        yearlyInterest += monthlyPayments[month - 1].interest;
      }
    }
    
    cumulativeInterest += yearlyInterest;
    const interestPercentage = totalInterest > 0 ? (cumulativeInterest / totalInterest) * 100 : 0;
    
    yearlyData.push({
      year,
      cumulativeInterest,
      interestPercentage,
      yearlyInterest
    });
    
    // 如果已经到达贷款期限，停止计算
    if (endMonth >= monthlyPayments.length) {
      break;
    }
  }
  
  return yearlyData;
}
