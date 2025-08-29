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

// 提前还贷接口
export interface EarlyRepaymentInput {
  originalLoan: LoanInput; // 原始贷款信息
  repaymentMonth: number; // 提前还贷的月份（第几个月）
  repaymentAmount: number; // 提前还贷金额
  repaymentType: 'reduceTime' | 'reduceAmount'; // 还贷方式：缩短年限 或 减少月供
}

export interface EarlyRepaymentResult {
  original: LoanResult; // 原始还款计划
  afterRepayment: LoanResult; // 提前还贷后的还款计划
  savedInterest: number; // 节省的利息
  savedMonths?: number; // 节省的月数（缩短年限时）
  newMonthlyPayment?: number; // 新的月供金额（减少月供时）
}

// 计算提前还贷
export function calculateEarlyRepayment(input: EarlyRepaymentInput): EarlyRepaymentResult {
  const { originalLoan, repaymentMonth, repaymentAmount, repaymentType } = input;
  
  // 计算原始还款计划
  const originalResult = calculateMortgage(originalLoan);
  
  // 获取提前还贷时点的剩余本金（正常还款后的剩余本金）
  const repaymentMonthData = originalResult.monthlyPayments[repaymentMonth - 1];
  if (!repaymentMonthData) {
    throw new Error('Invalid repayment month');
  }
  
  const remainingPrincipalAfterNormalPayment = repaymentMonthData.remainingPrincipal;
  const newPrincipal = Math.max(0, remainingPrincipalAfterNormalPayment - repaymentAmount);
  const remainingMonths = originalLoan.loanTerm * 12 - repaymentMonth;
  
  if (newPrincipal <= 0) {
    // 如果提前还清了
    const earlyPayoffResult: LoanResult = {
      monthlyPayments: originalResult.monthlyPayments.slice(0, repaymentMonth),
      totalInterest: originalResult.monthlyPayments.slice(0, repaymentMonth)
        .reduce((sum, payment) => sum + payment.interest, 0),
      totalPayment: originalResult.monthlyPayments.slice(0, repaymentMonth)
        .reduce((sum, payment) => sum + payment.totalPayment, 0) + repaymentAmount,
      firstMonthPayment: originalResult.firstMonthPayment,
      lastMonthPayment: repaymentMonthData.totalPayment
    };
    
    return {
      original: originalResult,
      afterRepayment: earlyPayoffResult,
      savedInterest: originalResult.totalInterest - earlyPayoffResult.totalInterest,
      savedMonths: remainingMonths,
      newMonthlyPayment: 0
    };
  }
  
  // 创建新的贷款输入参数（基于提前还贷后的剩余本金）
  const newLoanInput: LoanInput = {
    ...originalLoan,
    loanAmount: newPrincipal
  };
  
  let newResult: LoanResult;
  let savedMonths = 0;
  let newMonthlyPayment = 0;
  
  if (repaymentType === 'reduceTime') {
    // 缩短年限：保持月供不变，计算新的总还款期限
    const originalMonthlyPayment = originalResult.monthlyPayments[0].totalPayment;
    const monthlyInterestRate = originalLoan.interestRate / 100 / 12;
    
    // 目标：找到总期数，使得在保持月供不变的情况下能够还清贷款
    // 计算：前repaymentMonth期正常还款 + 后续期数保持月供不变
    // 设总期数为T，则后续期数为(T - repaymentMonth)
    // 需要满足：newPrincipal = originalMonthlyPayment * [1-(1+r)^-(T-repaymentMonth)] / r
    
    let newTotalTermMonths;
    if (monthlyInterestRate === 0) {
      newTotalTermMonths = repaymentMonth + Math.ceil(newPrincipal / originalMonthlyPayment);
    } else {
      const futureTerms = Math.ceil(
        -Math.log(1 - (newPrincipal * monthlyInterestRate / originalMonthlyPayment)) / 
        Math.log(1 + monthlyInterestRate)
      );
      newTotalTermMonths = repaymentMonth + futureTerms;
    }
    
    // 构建新的还款计划：前repaymentMonth期保持原样 + 后续期数重新计算
    const futureMonths = newTotalTermMonths - repaymentMonth;
    
    // 直接按等额本息公式计算后续每月还款
    const futureMonthlyPayment = originalMonthlyPayment; // 保持月供不变
    
    // 构建后续还款计划
    const adjustedFuturePayments: MonthlyPayment[] = [];
    let remainingBalance = newPrincipal;
    
    for (let i = 0; i < futureMonths; i++) {
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = futureMonthlyPayment - interestPayment;
      
      // 最后一期处理余额
      if (i === futureMonths - 1) {
        const finalPayment = remainingBalance + interestPayment;
        adjustedFuturePayments.push({
          month: repaymentMonth + i + 1,
          principal: remainingBalance,
          interest: interestPayment,
          totalPayment: finalPayment,
          remainingPrincipal: 0
        });
        break;
      }
      
      remainingBalance -= principalPayment;
      
      adjustedFuturePayments.push({
        month: repaymentMonth + i + 1,
        principal: principalPayment,
        interest: interestPayment,
        totalPayment: futureMonthlyPayment,
        remainingPrincipal: remainingBalance
      });
    }
    
    // 构建完整的还款计划
    const combinedPayments = [
      ...originalResult.monthlyPayments.slice(0, repaymentMonth),
      ...adjustedFuturePayments
    ];
    
    newResult = {
      monthlyPayments: combinedPayments,
      totalInterest: combinedPayments.reduce((sum, payment) => sum + payment.interest, 0),
      totalPayment: combinedPayments.reduce((sum, payment) => sum + payment.totalPayment, 0) + repaymentAmount,
      firstMonthPayment: originalResult.firstMonthPayment,
      lastMonthPayment: adjustedFuturePayments[adjustedFuturePayments.length - 1]?.totalPayment || 0
    };
    
    savedMonths = (originalLoan.loanTerm * 12) - newTotalTermMonths;
    
  } else {
    // 减少月供：保持期限不变，计算新的月供
    newLoanInput.loanTerm = Math.ceil(remainingMonths / 12);
    const tempResult = calculateMortgage(newLoanInput);
    
    // 只取剩余的月数
    const actualPayments = tempResult.monthlyPayments.slice(0, remainingMonths);
    
    // 构建完整的还款计划：原计划前N个月 + 新计划
    const combinedPayments = [
      ...originalResult.monthlyPayments.slice(0, repaymentMonth),
      ...actualPayments
    ];
    
    newResult = {
      monthlyPayments: combinedPayments,
      totalInterest: combinedPayments.reduce((sum, payment) => sum + payment.interest, 0),
      totalPayment: combinedPayments.reduce((sum, payment) => sum + payment.totalPayment, 0) + repaymentAmount,
      firstMonthPayment: originalResult.firstMonthPayment,
      lastMonthPayment: actualPayments[actualPayments.length - 1]?.totalPayment || 0
    };
    
    newMonthlyPayment = tempResult.monthlyPayments[0]?.totalPayment || 0;
  }
  
  return {
    original: originalResult,
    afterRepayment: newResult,
    savedInterest: originalResult.totalInterest - newResult.totalInterest,
    savedMonths: repaymentType === 'reduceTime' ? savedMonths : undefined,
    newMonthlyPayment: repaymentType === 'reduceAmount' ? newMonthlyPayment : undefined
  };
}
