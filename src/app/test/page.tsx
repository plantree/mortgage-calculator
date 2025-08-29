import { calculateMortgage, calculateEarlyRepayment } from '../lib/mortgage-calculator';

export default function TestPage() {
  const runTest = () => {
    // 测试用例：100万贷款，30年期，5%利率
    const loanInput = {
      loanType: 'commercial' as const,
      loanAmount: 1000000,
      loanTerm: 30,
      interestRate: 5.0,
      paymentMethod: 'equalPrincipalAndInterest' as const,
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
        repaymentType: 'reduceTime' as const
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
      
    } catch (error: unknown) {
      console.error('计算出错:', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">提前还贷计算测试</h1>
      <button 
        onClick={runTest}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        运行测试
      </button>
      <p className="mt-4 text-gray-600">
        点击按钮运行测试，结果会在浏览器控制台显示
      </p>
    </div>
  );
}
