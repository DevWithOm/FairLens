import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend
} from 'recharts';

export default function DriftChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generate 12 data points simulating the last 12 audit sessions
    // Pattern: start at ~0.75, drift down to ~0.55 by session 8, jump to ~0.88 after session 9
    const generatedData = Array.from({ length: 12 }).map((_, i) => {
      const sessionNum = i + 1;
      let disparateImpact, statisticalParity;
      
      if (sessionNum <= 8) {
        disparateImpact = 0.75 - (sessionNum * 0.025);
        statisticalParity = -0.10 - (sessionNum * 0.015);
      } else {
        disparateImpact = 0.88 + ((sessionNum - 9) * 0.005);
        statisticalParity = -0.05 + ((sessionNum - 9) * 0.005);
      }

      return {
        session: `Audit ${sessionNum}`,
        disparateImpact: Number(disparateImpact.toFixed(2)),
        statisticalParity: Number(statisticalParity.toFixed(2)),
        timestamp: `Jan ${10 + i}`
      };
    });

    setData(generatedData);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const di = payload[0].value;
      const status = di >= 0.80 ? 'Compliant' : di >= 0.70 ? 'At Risk' : 'Critical';
      const statusColor = status === 'Compliant' ? 'var(--color-lime, #a3e635)' : status === 'At Risk' ? 'var(--color-amber, #fbbf24)' : 'var(--color-red, #ef4444)';

      return (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
          padding: '12px',
          borderRadius: '8px',
          color: 'var(--color-text, #f5f5f5)',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
            Status: <span style={{ color: statusColor, fontWeight: 'bold' }}>{status}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, rgba(255,255,255,0.1))" vertical={false} />
        <XAxis 
          dataKey="session" 
          stroke="var(--color-muted, #878c91)" 
          tick={{ fill: 'var(--color-muted, #878c91)', fontSize: 12 }} 
        />
        <YAxis 
          stroke="var(--color-muted, #878c91)" 
          tick={{ fill: 'var(--color-muted, #878c91)', fontSize: 12 }}
          domain={[0, 1]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        
        <ReferenceLine 
          y={0.80} 
          stroke="var(--color-amber, #fbbf24)" 
          strokeDasharray="5 5" 
          label={{ position: 'top', value: 'EEOC Threshold', fill: 'var(--color-amber, #fbbf24)', fontSize: 12 }} 
        />
        <ReferenceLine 
          x="Audit 9" 
          stroke="var(--color-lime, #a3e635)" 
          strokeDasharray="3 3" 
          label={{ position: 'insideTopRight', value: 'Fix Applied', fill: 'var(--color-lime, #a3e635)', fontSize: 12 }} 
        />

        <Line 
          type="monotone" 
          dataKey="disparateImpact" 
          name="Disparate Impact"
          stroke="var(--color-lime, #a3e635)" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--color-surface, #14181c)', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          animationDuration={1500}
        />
        <Line 
          type="monotone" 
          dataKey="statisticalParity" 
          name="Statistical Parity"
          stroke="var(--color-blue, #60a5fa)" 
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--color-surface, #14181c)', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
