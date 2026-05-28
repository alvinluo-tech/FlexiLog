/**
 * Map exercise names (English/Chinese) to demonstration image paths.
 * Images are stored in public/images/exercises/.
 */
export function getDemoImage(name: string): string | null {
  const n = name.toLowerCase()
  if (n.includes('bench press') || n.includes('卧推')) return '/images/exercises/bench_press.png'
  if (n.includes('squat') || n.includes('深蹲')) {
    if (!n.includes('split') && !n.includes('分腿') && !n.includes('史密斯') && !n.includes('哈克') && !n.includes('酒杯') && !n.includes('高脚杯')) {
      return '/images/exercises/squat.png'
    }
  }
  if (n.includes('deadlift') || n.includes('硬拉')) {
    if (!n.includes('romanian') && !n.includes('罗马尼亚') && !n.includes('直腿') && !n.includes('架上') && !n.includes('相扑')) {
      return '/images/exercises/deadlift.png'
    }
  }
  if (n.includes('barbell row') || n.includes('杠铃划船')) return '/images/exercises/barbell_row.png'
  if (n.includes('lat pulldown') || n.includes('高位下拉')) return '/images/exercises/lat_pulldown.png'
  if (n.includes('pull-up') || n.includes('pullup') || n.includes('引体向上')) {
    if (!n.includes('反握') && !n.includes('宽握') && !n.includes('窄握')) {
      return '/images/exercises/pull_ups.png'
    }
  }
  if (n.includes('overhead press') || n.includes('过头推举') || n.includes('站姿推举') || n.includes('杠铃推举')) {
    if (n.includes('杠铃') || n.includes('overhead')) {
      return '/images/exercises/overhead_press.png'
    }
  }
  if (n.includes('romanian deadlift') || n.includes('罗马尼亚硬拉')) return '/images/exercises/romanian_deadlift.png'
  if (n.includes('lateral raise') || n.includes('侧平举')) {
    if (n.includes('哑铃') || n.includes('lateral')) {
      return '/images/exercises/dumbbell_lateral_raise.png'
    }
  }
  if (n.includes('barbell curl') || n.includes('杠铃弯举')) return '/images/exercises/barbell_curl.png'
  if (n.includes('hammer curl') || n.includes('锤式弯举')) return '/images/exercises/hammer_curl.png'
  if (n.includes('tricep pushdown') || n.includes('三头下压') || n.includes('绳索下压')) return '/images/exercises/tricep_pushdown.png'
  if (n.includes('plank') || n.includes('平板支撑')) {
    if (!n.includes('侧')) {
      return '/images/exercises/plank.png'
    }
  }
  if (n.includes('incline dumbbell press') || n.includes('哑铃上斜卧推')) return '/images/exercises/incline_dumbbell_press.png'
  if (n.includes('cable fly') || n.includes('绳索飞鸟') || n.includes('龙门架夹胸')) return '/images/exercises/cable_flyes.png'
  if (n.includes('push-up') || n.includes('pushup') || n.includes('俯卧撑')) return '/images/exercises/push_ups.png'
  if (n.includes('dip') || n.includes('双杠臂屈伸')) return '/images/exercises/dips.png'
  if (n.includes('dumbbell row') || n.includes('哑铃单臂划船') || n.includes('哑铃俯身划船')) return '/images/exercises/dumbbell_row.png'
  if (n.includes('leg press') || n.includes('腿举')) return '/images/exercises/leg_press.png'
  if (n.includes('leg curl') || n.includes('腿弯举')) return '/images/exercises/leg_curl.png'
  if (n.includes('leg extension') || n.includes('腿屈伸')) return '/images/exercises/leg_extension.png'
  if (n.includes('dumbbell shoulder press') || n.includes('哑铃坐姿推举') || n.includes('哑铃站姿推举') || n.includes('哑铃推举')) return '/images/exercises/dumbbell_shoulder_press.png'
  if (n.includes('calf raise') || n.includes('提踵')) return '/images/exercises/calf_raises.png'

  // Approximate matches (same muscle group, visually similar)
  if (n.includes('dumbbell bicep curl') || n.includes('哑铃交替弯举') || n.includes('哑铃斜托弯举') || n.includes('哑铃蜘蛛弯举') || n.includes('哑铃集中弯举') || n.includes('上斜哑铃弯举')) return '/images/exercises/hammer_curl.png'
  if (n.includes('side plank') || n.includes('侧平板支撑')) return '/images/exercises/plank.png'
  if (n.includes('bulgarian split squat') || n.includes('保加利亚分腿蹲')) return '/images/exercises/squat.png'
  
  return null
}
