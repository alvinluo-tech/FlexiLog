// Test setup - sandbox-mode mocks for Supabase and environment
import { vi } from 'vitest'

// Mock environment variables for tests
process.env.MIMO_API_KEY = 'test-api-key'
process.env.MIMO_BASE_URL = 'https://test-api.example.com/v1'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Supabase client factory
vi.mock('@/lib/supabase/server', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  }
  return { createClient: vi.fn().mockResolvedValue(mockSupabase) }
})

// Mock fetch for API tests
global.fetch = vi.fn()
