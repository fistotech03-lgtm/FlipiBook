# Workspace Guidelines & Rules

## Git Operations Safety Rule (Strictly Enforced)

Before executing any Git write or branching operations, specifically:
- `git push` (to any remote branch e.g. `origin/murugan`, `origin/jagulin`, etc.)
- `git merge` (merging any branch into another)
- `git rebase` (rebasing any branch)
- `git reset --hard` / `git checkout -- .` (destructive operations)

The agent **MUST ALWAYS** ask the user for explicit permission first.

### Required Protocol:
1. Explain what changes are ready.
2. State the exact Git command, target branch, and source branch.
3. Prompt the user for permission.
4. **DO NOT** execute the push, merge, or rebase until the user explicitly grants approval in chat.

