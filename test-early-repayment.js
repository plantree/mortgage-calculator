// 简单的测试脚本来验证提前还贷计算逻辑
import { calculateMortgage, calculateEarlyRepayment } from './src/lib/mortgage-calculator.js';

// 测试用例：100万贷款，30年期，5%利率
const loanInput = {
  loanType: 'commercial',
  loanAmount: 1000000,
  loanTerm: 30,
  interestRate: 5.0,
  paymentMethod: 'equalPrincipalAndInterest',
  downPayment: 200000,
  commercialLoanAmount: 1000000,
  providentFundLoanAmount: 0,
  commercialInterestRate: 5.0,
  providentFundInterestRate: 3.25
};

console.log('=== 测试提前还贷计算 ===');

try {
  // 计算原始贷款
  const originalResult = calculateMortgage(loanInput);
  console.log('原始贷款：');
  console.log(`月供: ${originalResult.monthlyPayments[0].totalPayment.toFixed(2)}`);
  console.log(`总利息: ${originalResult.totalInterest.toFixed(2)}`);
  console.log(`总还款: ${originalResult.totalPayment.toFixed(2)}`);
  console.log(`总期数: ${originalResult.monthlyPayments.length}`);
  
  // 测试第60个月提前还贷20万，缩短年限
  const earlyRepaymentInput = {
    originalLoan: loanInput,
    repaymentMonth: 60,
    repaymentAmount: 200000,
    repaymentType: 'reduceTime'
  };
  
  const result = calculateEarlyRepayment(earlyRepaymentInput);
  
  console.log('\n提前还贷结果（缩短年限）：');
  console.log(`原始总期数: ${result.original.monthlyPayments.length}`);
  console.log(`新总期数: ${result.afterRepayment.monthlyPayments.length}`);
  console.log(`节省期数: ${result.savedMonths}`);
  console.log(`原始总利息: ${result.original.totalInterest.toFixed(2)}`);
  console.log(`新总利息: ${result.afterRepayment.totalInterest.toFixed(2)}`);
  console.log(`节省利息: ${result.savedInterest.toFixed(2)}`);
  console.log(`月供保持: ${result.newMonthlyPayment}`);
  
  // 验证月供是否保持不变
  const originalMonthlyPayment = result.original.monthlyPayments[0].totalPayment;
  const newMonthlyPayment = result.afterRepayment.monthlyPayments[60].totalPayment; // 第61期的月供
  console.log(`原始月供: ${originalMonthlyPayment.toFixed(2)}`);
  console.log(`提前还贷后月供: ${newMonthlyPayment.toFixed(2)}`);
  
} catch (error) {
  console.error('计算出错:', error.message);
}
