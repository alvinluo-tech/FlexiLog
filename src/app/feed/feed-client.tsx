'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, ChatCircle, Share, Barbell, User } from '@phosphor-icons/react'
import { toggleLike, addComment } from '@/app/actions/social'

interface Post {
  id: string
  user_id: string
  title: string
  description: string | null
  workout_data: any
  likes_count: number
  comments_count: number
  created_at: string
}

interface Props {
  posts: Post[]
  currentUserId: string
}

export default function FeedClient({ posts, currentUserId }: Props) {
  const [localPosts, setLocalPosts] = useState(posts)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})

  const handleLike = async (postId: string) => {
    const result = await toggleLike(postId)
    if (!result.error) {
      setLocalPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes_count: result.liked ? p.likes_count + 1 : p.likes_count - 1 }
        }
        return p
      }))
    }
  }

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]
    if (!content?.trim()) return

    const result = await addComment(postId, content)
    if (!result.error) {
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
      setLocalPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments_count: p.comments_count + 1 }
        }
        return p
      }))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000)
    if (diffHours < 1) return '刚刚'
    if (diffHours < 24) return diffHours + '小时前'
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }

  const getWorkoutSummary = (data: any) => {
    if (!data?.workout_sets) return { exercises: 0, sets: 0, volume: 0 }
    const sets = data.workout_sets
    const exercises = [...new Set(sets.map((s: any) => s.exercises?.name).filter(Boolean))]
    const volume = sets.reduce((sum: number, s: any) => sum + (Number(s.weight_kg) || 0) * (s.reps || 0), 0)
    return { exercises: exercises.length, sets: sets.length, volume }
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">社区动态</h1>

      {localPosts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
            <p className="text-[var(--text-tertiary)]">暂无分享的训练</p>
          </CardContent>
        </Card>
      ) : (
        localPosts.map(post => {
          const summary = getWorkoutSummary(post.workout_data)
          return (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--surface-3)] flex items-center justify-center">
                    <User className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">用户</p>
                    <p className="text-xs text-[var(--text-disabled)]">{formatDate(post.created_at)}</p>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold mb-1">{post.title}</h3>
                {post.description && <p className="text-sm text-[var(--text-tertiary)] mb-3">{post.description}</p>}

                {/* Workout Summary */}
                <div className="flex gap-4 p-3 rounded-lg bg-[var(--surface-2)] mb-3">
                  <div className="text-center">
                    <p className="text-lg font-bold data-number">{summary.exercises}</p>
                    <p className="text-xs text-[var(--text-disabled)]">动作</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold data-number">{summary.sets}</p>
                    <p className="text-xs text-[var(--text-disabled)]">组数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold data-number">{(summary.volume / 1000).toFixed(1)}T</p>
                    <p className="text-xs text-[var(--text-disabled)]">训练量</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-default)]">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="data-number">{post.likes_count}</span>
                  </button>
                  <button 
                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]"
                  >
                    <ChatCircle className="h-5 w-5" />
                    <span className="data-number">{post.comments_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] ml-auto">
                    <Share className="h-5 w-5" />
                  </button>
                </div>

                {/* Comment Input */}
                {showComments[post.id] && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="添加评论..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1 bg-[var(--surface-2)] border-[var(--border-default)]"
                    />
                    <Button size="sm" onClick={() => handleComment(post.id)}>发布</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
