import {
  ComposedChart, Area, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { PBW_RISK_THRESHOLD_GDD } from '../lib/gdd'

// Format "2024-07-01" → "Jul 1" for X-axis labels
function fmtDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

// Custom tooltip shown on hover
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="gdd-tooltip">
      <p className="gdd-tooltip-date">{label}</p>
      <p className="gdd-tooltip-total">
        Accumulated: <strong>{payload[0].value.toFixed(1)} GDD</strong>
      </p>
      <p className="gdd-tooltip-daily">
        Daily: +{payload[0].payload.degreeDays.toFixed(1)}
      </p>
    </div>
  )
}

export default function GddChart({ dailyLog }) {
  if (!dailyLog?.length) return null

  // Recharts needs plain objects; format dates for display
  const data = dailyLog.map((d) => ({
    date: fmtDate(d.date),
    runningTotal: parseFloat(d.runningTotal.toFixed(1)),
    degreeDays: parseFloat(d.degreeDays.toFixed(1)),
  }))

  // Colour the area red once threshold is crossed, green before
  const thresholdCrossed = dailyLog[dailyLog.length - 1].runningTotal >= PBW_RISK_THRESHOLD_GDD

  return (
    <div className="gdd-chart-wrapper">
      <h4 className="gdd-chart-title">
        Pink Bollworm Degree-Day Accumulation
        <span className="gdd-chart-subtitle"> (threshold: {PBW_RISK_THRESHOLD_GDD} GDD)</span>
      </h4>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gddGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={thresholdCrossed ? '#e05c5c' : '#4caf50'} stopOpacity={0.35} />
              <stop offset="95%" stopColor={thresholdCrossed ? '#e05c5c' : '#4caf50'} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            domain={[0, Math.max(PBW_RISK_THRESHOLD_GDD * 1.1, dailyLog[dailyLog.length - 1].runningTotal * 1.1)]}
            tickFormatter={(v) => v.toFixed(0)}
            label={{ value: 'GDD', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={28} />

          {/* Horizontal risk threshold line */}
          <ReferenceLine
            y={PBW_RISK_THRESHOLD_GDD}
            stroke="#d32f2f"
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{
              value: `Risk threshold (${PBW_RISK_THRESHOLD_GDD})`,
              fill: '#d32f2f',
              fontSize: 11,
              position: 'insideTopRight',
            }}
          />

          {/* Area line for running GDD total */}
          <Area
            type="monotone"
            dataKey="runningTotal"
            name="Accumulated GDD"
            stroke={thresholdCrossed ? '#e05c5c' : '#4caf50'}
            strokeWidth={2}
            fill="url(#gddGrad)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
