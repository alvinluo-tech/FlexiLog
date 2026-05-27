import { getEmailLayout } from './layout'

export function getWeeklyReportEmailHtml(
  userName: string,
  stats: {
    workouts: number
    totalVolume: number
    streak: number
    topExercise: string
  },
  dashboardUrl: string
) {
  const content = `
    <h2>周报 - ${userName}</h2>
    <p>这是你本周的训练总结：</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
      <div style="background: #18181b; border-radius: 10px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${stats.workouts}</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 4px;">训练次数</div>
      </div>
      <div style="background: #18181b; border-radius: 10px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #22c55e;">${(stats.totalVolume / 1000).toFixed(1)}T</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 4px;">总容量</div>
      </div>
      <div style="background: #18181b; border-radius: 10px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${stats.streak}</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 4px;">连续天数</div>
      </div>
      <div style="background: #18181b; border-radius: 10px; padding: 16px; text-align: center;">
        <div style="font-size: 14px; font-weight: 600; color: #fafafa; margin-top: 8px;">${stats.topExercise}</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 4px;">最佳动作</div>
      </div>
    </div>
    
    <a href="${dashboardUrl}" class="button">查看详细报告</a>
    
    <div class="divider"></div>
    
    <div class="info-box">
      <p>💪 继续保持！坚持训练，你会看到更好的自己。</p>
    </div>
  `
  
  return getEmailLayout(content)
}
