import React, { useState, useEffect, useRef } from 'react';

interface StatItem {
  raw: string;
  label: string;
}

const STATS: StatItem[] = [
  { raw: '2450', label: 'Properties Sold' },
  { raw: '98', label: 'Client Satisfaction' },
  { raw: '150', label: 'Cities Covered' },
  { raw: '10000', label: 'Market Value (Cr)' },
];

function useCountUp(target: number, duration = 1400, trigger: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);

  return value;
}

interface CounterProps {
  raw: string;
  label: string;
  trigger: boolean;
}

const StatCounter: React.FC<CounterProps> = ({ raw, label, trigger }) => {
  const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  const counted = useCountUp(num, 1400, trigger);

  const display = (() => {
    if (label === 'Properties Sold') return `${counted.toLocaleString('en-IN')}+`;
    if (label === 'Client Satisfaction') return `${counted}%`;
    if (label === 'Cities Covered') return `${counted}+`;
    if (label === 'Market Value (Cr)') {
      const cr = counted >= 10000 ? '₹10,000 Cr' : `₹${counted} Cr`;
      return trigger && counted >= 10000 ? '₹10,000 Cr' : cr;
    }
    return String(counted);
  })();

  return (
    <div className="text-center">
      <div className="font-space-mono font-bold text-4xl text-[#2563EB] mb-2">{display}</div>
      <div className="font-syne font-medium text-sm text-[#6b7280] uppercase tracking-wider">{label}</div>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#F0EBE5] border-y border-[rgba(212,117,91,0.05)] py-12">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-4 divide-x divide-[rgba(212,117,91,0.1)]">
          {STATS.map(stat => (
            <StatCounter key={stat.label} raw={stat.raw} label={stat.label} trigger={triggered} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
