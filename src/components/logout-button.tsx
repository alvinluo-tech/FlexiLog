'use client'

import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { SignOut } from '@phosphor-icons/react'

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button 
        type="submit" 
        variant="ghost" 
        size="sm"
        className="text-[var(--text-tertiary)] hover:text-[var(--danger)]"
      >
        <SignOut className="h-4 w-4 mr-2" />
        退出登录
      </Button>
    </form>
  )
}
