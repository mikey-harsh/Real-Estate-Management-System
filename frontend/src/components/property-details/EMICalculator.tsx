import React, { useState, useMemo } from 'react';

interface EMICalculatorProps {
  propertyPrice: number;
}

function fmtInr(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const EMICalculator: React.FC<EMICalculatorProps> = ({ propertyPrice }) => {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const { loanAmount, monthlyEMI, totalInterest, totalPayment } = useMemo(() => {
    const down = (downPaymentPct / 100) * propertyPrice;
    const loan = propertyPrice - down;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    const emi =
      r === 0
        ? loan / n
        : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return {
      loanAmount: loan,
      monthlyEMI: emi,
      totalInterest: emi * n - loan,
      totalPayment: emi * n,
    };
  }, [propertyPrice, downPaymentPct, interestRate, tenureYears]);

  return (
    <div className="bg-white border border-[#E6E0DA] rounded-2xl p-6 shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-icons text-[#2563EB]">calculate</span>
        <h3 className="font-syne font-bold text-lg text-[#221410]">EMI Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="font-manrope text-xs text-[#64748B] uppercase tracking-wider">
              Down Payment
            </label>
            <span className="font-space-mono text-xs text-[#2563EB] font-bold">{downPaymentPct}%</span>
          </div>
          <input
            type="range" min={10} max={50} step={5}
            value={downPaymentPct}
            onChange={e => setDownPaymentPct(Number(e.target.value))}
            className="w-full accent-[#2563EB] cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className="font-manrope text-xs text-[#9CA3AF]">10%</span>
            <span className="font-manrope text-xs text-[#9CA3AF]">50%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="font-manrope text-xs text-[#64748B] uppercase tracking-wider">
              Interest Rate
            </label>
            <span className="font-space-mono text-xs text-[#2563EB] font-bold">{interestRate}%</span>
          </div>
          <input
            type="range" min={6} max={15} step={0.5}
            value={interestRate}
            onChange={e => setInterestRate(Number(e.target.value))}
            className="w-full accent-[#2563EB] cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className="font-manrope text-xs text-[#9CA3AF]">6%</span>
            <span className="font-manrope text-xs text-[#9CA3AF]">15%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="font-manrope text-xs text-[#64748B] uppercase tracking-wider">
              Loan Tenure
            </label>
            <span className="font-space-mono text-xs text-[#2563EB] font-bold">{tenureYears} Yrs</span>
          </div>
          <input
            type="range" min={5} max={30} step={5}
            value={tenureYears}
            onChange={e => setTenureYears(Number(e.target.value))}
            className="w-full accent-[#2563EB] cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className="font-manrope text-xs text-[#9CA3AF]">5 Yrs</span>
            <span className="font-manrope text-xs text-[#9CA3AF]">30 Yrs</span>
          </div>
        </div>
      </div>

      <div className="mt-5 bg-[#F0F7FF] rounded-xl p-4 space-y-2">
        <div className="flex justify-between">
          <span className="font-manrope text-sm text-[#374151]">Loan Amount</span>
          <span className="font-space-mono text-sm font-bold text-[#221410]">{fmtInr(loanAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-[#DBEAFE] pt-2">
          <span className="font-manrope text-sm font-semibold text-[#374151]">Monthly EMI</span>
          <span className="font-space-mono text-base font-bold text-[#2563EB]">{fmtInr(monthlyEMI)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-manrope text-sm text-[#374151]">Total Interest</span>
          <span className="font-space-mono text-sm font-bold text-[#DC2626]">{fmtInr(totalInterest)}</span>
        </div>
        <div className="flex justify-between border-t border-[#DBEAFE] pt-2">
          <span className="font-manrope text-sm font-semibold text-[#221410]">Total Payment</span>
          <span className="font-space-mono text-sm font-bold text-[#221410]">{fmtInr(totalPayment)}</span>
        </div>
      </div>

      <p className="font-manrope text-xs text-[#9CA3AF] mt-3 text-center">
        *Indicative estimate only. Consult your bank for exact rates.
      </p>
    </div>
  );
};

export default EMICalculator;
