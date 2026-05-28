'use client'

import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface Props { data: { date: string; volume: number }[] }

export default function VolumeChart({ data }: Props) {
  if (!data.length) return <div className="h-48 flex items-center justify-center text-[var(--text-disabled)]">暂无数据</div>

  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const labels = sorted.map(d => new Date(d.date).toLocaleDateString('zh-CN', { weekday: 'short' }))

  return (
    <div className="h-48">
      <Bar data={{
        labels,
        datasets: [{
          label: '训练量',
          data: sorted.map(d => d.volume / 1000),
          backgroundColor: 'rgba(59,130,246,0.6)',
          borderColor: 'var(--accent)',
          borderWidth: 1,
          borderRadius: 6,
        }]
      }} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--surface-2)', titleColor: 'var(--text-primary)', bodyColor: 'var(--text-tertiary)', displayColors: false, callbacks: { label: (ctx: any) => ctx.parsed.y.toFixed(1) + ' T' } } },
        scales: { x: { grid: { display: false }, ticks: { color: 'var(--text-disabled)', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-disabled)', font: { size: 11 }, callback: (v: any) => v + 'T' } } }
      }} />
    </div>
  )
}
