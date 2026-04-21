import React, { useMemo } from 'react'
import { demographicDistribution } from '../../lib/biasEngine'
import { Users, AlertTriangle, PieChart as PieChartIcon } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS = ['#63B3ED', '#38B2AC', '#48BB78', '#ECC94B', '#ED8936', '#FC8181', '#B794F4', '#F687B3']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.8125rem'
    }}>
      <p style={{ fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: payload[0].color || 'var(--text-secondary)' }}>
        Count: {payload[0].value?.toLocaleString()}
      </p>
    </div>
  )
}

export default function DemographicCharts({ rows, columns, sensitiveAttrs, t = (s) => s }) {
  const demographics = useMemo(() => {
    if (!sensitiveAttrs?.length || !rows?.length) return []
    return sensitiveAttrs.map(attr => ({
      attr,
      data: demographicDistribution(rows, attr)
    }))
  }, [rows, sensitiveAttrs])

  const hasUnderrepresented = demographics.some(d => d.data.some(item => item.underrepresented))

  if (!demographics.length) return null

  return (
    <div className="card fade-in-up" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('Demographic Distribution')}</h3>
          </div>
          {hasUnderrepresented && (
            <span className="badge badge-red">
              <AlertTriangle size={12} /> {t('Underrepresented groups detected')}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(demographics.length, 2)}, 1fr)`, gap: '24px' }}>
          {demographics.map(({ attr, data }) => {
            const pieData = data.map(d => ({ name: d.value, value: d.count }))
            return (
              <div key={attr}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge badge-purple">{attr}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {data.length} groups
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Pie Chart */}
                  <div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                          outerRadius={70} innerRadius={40} paddingAngle={2}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar Chart */}
                  <div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={data.map(d => ({ name: d.value, count: d.count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Group list with warning badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {data.map((d, i) => (
                    <span key={d.value} style={{
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: d.underrepresented
                        ? 'rgba(252,129,129,0.12)'
                        : `${COLORS[i % COLORS.length]}18`,
                      color: d.underrepresented ? '#FC8181' : COLORS[i % COLORS.length],
                      border: `1px solid ${d.underrepresented ? 'rgba(252,129,129,0.3)' : 'transparent'}`
                    }}>
                      {d.underrepresented && '⚠ '}{d.value}: {d.percentage.toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
