'use client'

import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface Props { data: { date: string; volume: number }[] }

export default function VolumeChart({ data }: Props) {
  if (!data.length) return <div className="h-48 flex items-center justify-center text-[var(--text-disabled)]">No data</div>

  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const labels = sorted.map(d => new Date(d.date).toLocaleDateString('en', { weekday: 'short' }))

  return (
    <div className="h-48">
      <Bar data={{
        labels,
        datasets: [{
          label: 'Volume',
          data: sorted.map(d => d.volume / 1000),
          backgroundColor: 'rgba(10,132,255,0.6)',
          borderColor: '#0a84ff',
          borderWidth: 1,
          borderRadius: 6,
        }]
      }} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1c1c1e', titleColor: '#fff', bodyColor: '#8e8e93', displayColors: false, callbacks: { label: (ctx: any) => ctx.parsed.y.toFixed(1) + ' T' } } },
        scales: { x: { grid: { display: false }, ticks: { color: '#636366', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#636366', font: { size: 11 }, callback: (v: any) => v + 'T' } } }
      }} />
    </div>
  )
}
