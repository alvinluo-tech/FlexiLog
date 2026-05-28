// Workout defaults
export const DEFAULT_REST_SECONDS = 90
export const MIN_REST_SECONDS = 15
export const MAX_REST_SECONDS = 600

// AI API
export const AI_MODEL_NAME = 'mimo-v2.5-pro'
export const AI_REQUEST_TIMEOUT_MS = 30000
export const AI_MAX_TOKENS = 4000
export const AI_CHAT_MAX_TOKENS = 4000
export const AI_TEMPERATURE = 0.7

// Pagination
export const DEFAULT_PAGE_LIMIT = 20
export const HISTORY_PAGE_LIMIT = 20
export const FEED_PAGE_LIMIT = 20
export const SESSIONS_PAGE_LIMIT = 10
export const WEIGHT_LOG_LIMIT = 30
export const PLANS_LIMIT = 5
export const CONVERSATIONS_LIMIT = 20

// Validation
export const MAX_REPS = 999
export const MIN_AGE = 10
export const MAX_AGE = 120
export const MIN_HEIGHT_CM = 50
export const MAX_HEIGHT_CM = 250
export const MIN_WEIGHT_KG = 20
export const MAX_WEIGHT_KG = 500
export const MIN_BODY_FAT = 1
export const MAX_BODY_FAT = 60

// UI
export const TEXTAREA_MAX_HEIGHT = 160
export const MESSAGE_MAX_WIDTH_PERCENT = 85

// Input validation limits
export const MAX_TITLE_LENGTH = 200
export const MAX_DESCRIPTION_LENGTH = 2000
export const MAX_COMMENT_LENGTH = 500
export const MAX_AI_MESSAGE_LENGTH = 2000
export const MAX_PLAN_JSON_LENGTH = 10000

// Rate limiting
export const AI_RATE_LIMIT = 20
export const AI_RATE_WINDOW_MS = 60_000
