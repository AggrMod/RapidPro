# LOCAL Claude Git Workflow

**CRITICAL:** Always follow this sequence when making repository changes!

## Before Making ANY Changes

```bash
# 1. Check current branch
git status

# 2. Fetch remote changes
git fetch origin

# 3. Check if remote has new commits
git log HEAD..origin/main --oneline

# 4. If remote has changes, pull them
git pull origin main

# 5. NOW you can make changes safely
```

## After Making Changes

```bash
# 6. Stage changes
git add <files>

# 7. Commit with clear message
git commit -m "Clear description of changes"

# 8. Push to remote
git push origin main
```

## Why This Matters

**Problem:** If Cloud Claude or Agent pushes changes while I'm working locally, and I don't pull first, I could:
- Create merge conflicts
- Overwrite their work
- Push incompatible changes

**Solution:** ALWAYS pull before modifying files.

## Multi-Agent Coordination

With 5-6 agents working in parallel:
- Agents work on separate branches (agent1-leads/*, agent2-quotes/*, etc.)
- LOCAL Claude merges to main
- Before merging agent branches, ALWAYS pull main first

## Exception: Documentation Only

If I'm only creating NEW documentation files in `/docs/internal/` that no agent is touching, I can skip the pull. But better safe than sorry - just pull anyway!

---

**Created:** November 15, 2025
**Reminder:** THIS IS NOT OPTIONAL - IT'S CRITICAL FOR MULTI-AGENT WORKFLOW
