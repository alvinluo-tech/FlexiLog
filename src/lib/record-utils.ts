export type RecordType = 'max_weight' | 'max_volume' | 'max_reps' | 'estimated_1rm'

const RECORD_LABELS: Record<RecordType, string> = {
  max_weight: '最大重量',
  max_volume: '最大训练量',
  max_reps: '最大次数',
  estimated_1rm: '预估1RM',
}

const RECORD_UNITS: Record<RecordType, string> = {
  max_weight: 'kg',
  max_volume: 'kg',
  max_reps: '次',
  estimated_1rm: 'kg',
}

export function getRecordLabel(type: RecordType): string {
  return RECORD_LABELS[type] || type
}

export function getRecordUnit(type: RecordType): string {
  return RECORD_UNITS[type] || ''
}
