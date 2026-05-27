<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Multi-Agent Collaboration

当多个 agent（hermes、antigravity 等）协作同一个项目时，遵守以下规则：

### COLLAB-LOG.md

- 项目根目录下有 `COLLAB-LOG.md`，记录所有 agent 的改动
- **改动前**：读最近 5 条 log，了解上下文，避免重复工作
- **改动后**：立即追加一行，格式：`| Time | Agent | Action | Files Changed | Notes |`
- Time 用 `YYYY-MM-DD HH:mm`，Agent 写你的名字（hermes / antigravity / 等）
- Notes 里简要说明为什么做这个改动，方便下一个 agent 理解意图
