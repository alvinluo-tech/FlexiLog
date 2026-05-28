'use client'

import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

interface Props { data: { date: string; weight: number }[] }

export default function WeightChart({ data }: Props) {
  if (!data.length) return <div className="h-48 flex items-center justify-center text-[var(--text-disabled)]">暂无数据</div>

  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const labels = sorted.map(d => new Date(d.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))

  return (
    <div className="h-48">
      <Line data={{
        labels,
        datasets: [{
          label: '体重',
          data: sorted.map(d => d.weight),
          borderColor: 'var(--accent)',
          backgroundColor: 'rgba(10,132,255,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: 'var(--accent)',
          pointBorderColor: 'var(--surface-0)',
          pointBorderWidth: 2,
        }]
      }} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--surface-2)', titleColor: 'var(--text-primary)', bodyColor: 'var(--text-tertiary)', displayColors: false, callbacks: { label: (ctx: any) => ctx.parsed.y + ' kg' } } },
        scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-disabled)', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-disabled)', font: { size: 11 }, callback: (v: any) => v + 'kg' } } }
      }} />
    </div>
  )
}
