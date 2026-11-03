# Git Operations Safety Rule

Before executing any Git write, branch-modifying, or remote sync operations:
- `git push`
- `git merge`
- `git rebase`
- `git reset --hard`

The agent **MUST ALWAYS** ask the user for explicit permission first.

### Protocol:
1. Clearly state what operation is to be performed (command, source branch, target branch).
2. Ask the user for explicit confirmation.
3. Wait for the user's approval before performing the action.

