'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { TimeSeriesPoint } from '@/lib/types/campaigns'

interface MetricsChartProps {
  data: TimeSeriesPoint[]
  type?: 'line' | 'bar'
  height?: number
}

const SERIES = [
  { key: 'opens', color: '#4f46e5', label: 'Opens' },
  { key: 'clicks', color: '#10b981', label: 'Clicks' },
  { key: 'unsubscribes', color: '#f59e0b', label: 'Unsubs' },
  { key: 'bounces', color: '#ef4444', label: 'Bounces' },
]

export function MetricsChart({ data, type = 'line', height = 260 }: MetricsChartProps) {
  const tickStyle = { fontSize: 11, fill: '#94a3b8' }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={tickStyle} tickLine={false} axisLine={false} />
          <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          {SERIES.map(s => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={tickStyle} tickLine={false} axisLine={false} />
        <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map(s => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
