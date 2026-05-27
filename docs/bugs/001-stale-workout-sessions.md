# BUG-001: 放弃训练后计时器持续存在（残留 Session 问题）

**日期**: 2025-05-27  
**严重级别**: 🔴 高  
**状态**: ✅ 已修复  
**影响模块**: `src/app/workout/live/`, `src/app/actions/workout.ts`

---

## 现象描述

用户在训练界面点击"放弃"后：

1. 客户端正确重置，显示训练大厅（Lobby）界面 ✅
2. 但切换到其他页面后再返回训练页面，**之前的计时器又出现了** ❌
3. 反复放弃多次后问题依旧，仿佛永远清不完

## 根因分析

### 核心问题：只删一条，遗留多条

每次用户点击"开始空白训练"，都会在 `workout_sessions` 表中插入一条新记录（`ended_at = NULL`）。

```
workout_sessions 表中的状态：
┌────────────┬────────────┬──────────┐
│ session_id │ started_at │ ended_at │
├────────────┼────────────┼──────────┤
│ aaa-111    │ 10:00      │ NULL     │  ← 第1次测试创建
│ bbb-222    │ 10:05      │ NULL     │  ← 第2次测试创建
│ ccc-333    │ 10:10      │ NULL     │  ← 第3次测试创建（当前）
└────────────┴────────────┴──────────┘
```

旧的 `discardWorkoutSession` 只通过 `.eq('id', sessionId)` 删除了**当前传入的那一条**（`ccc-333`），数据库中仍残留 `aaa-111` 和 `bbb-222`。

### 触发链路

```
用户点击放弃
  → 客户端状态重置（sessionStartTime = null）→ 显示 Lobby ✅
  → discardWorkoutSession(ccc-333) → 数据库只删除 ccc-333 ✅
  → 用户切换页面再回来
  → page.tsx 服务端查询: WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1
  → 查到了 bbb-222 → 传给客户端作为 initialSession
  → 计时器又出现了 ❌
```

## 修复方案

**改为删除当前用户的所有未结束 Session**，一次性清理全部残留：

```diff
- // 旧代码：只删传入的 sessionId
- const { error } = await supabase
-   .from('workout_sessions')
-   .delete()
-   .eq('id', sessionId)

+ // 新代码：删除该用户所有未结束的 session
+ const { error } = await supabase
+   .from('workout_sessions')
+   .delete()
+   .eq('user_id', user.id)
+   .is('ended_at', null)
```

同时增加了：
- 用户身份验证检查
- Service Role Key 缺失时降级到认证客户端

## 经验教训

### 1. 测试产生的脏数据会掩盖真实 Bug

> 开发和测试过程中反复创建的数据如果没有正确清理，会在数据库中累积，导致看似"修好了"的 Bug 反复出现。

### 2. 删除操作要考虑"是删一条还是删一批"

> 当业务逻辑上同一时间只应该存在一个活跃实体时（如：一个用户只能有一个进行中的训练），清理操作应该以**业务约束**为范围（删除该用户所有未结束的 session），而不是以**单条记录 ID** 为范围。

### 3. 客户端状态重置 ≠ 服务端数据清理

> 客户端 `setState(null)` 只影响当前渲染。一旦用户导航离开再回来，服务端组件会重新查库。如果数据库没清干净，问题就会"复活"。

### 4. 数据库约束可以从源头预防

> 可以考虑在数据库层面添加约束，保证一个用户同一时间只能有一个 `ended_at IS NULL` 的 session。例如通过 partial unique index：
>
> ```sql
> CREATE UNIQUE INDEX unique_active_session_per_user 
> ON workout_sessions (user_id) 
> WHERE ended_at IS NULL;
> ```

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/app/actions/workout.ts` | `discardWorkoutSession` 改为按 `user_id + ended_at IS NULL` 批量删除 |
| `src/app/workout/live/workout-client.tsx` | 移除放弃后的 `router.push('/dashboard')` 跳转，改为原地重置回 Lobby |
