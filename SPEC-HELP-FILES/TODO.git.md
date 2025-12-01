# Git Strategy: Branches + Worktrees

## Goal
Separate E2E testing frameworks (Cypress/Playwright) while maintaining shared backend codebase.

---

## Branch Structure

```
main          � Base project (no E2E tests)
cypress   � main + Cypress (branch from main)
playwright � main + Playwright (branch from main)
```

**Key:** Each E2E branch created from `main`, NOT from each other.

---

## Worktree Setup

```bash
# Create worktrees for parallel access
git worktree add ../project_1_base main
git worktree add ../project_2_cypress cypress
git worktree add ../project_3_playwright playwright
```

**Result:**
- 3 folders visible in filesystem
- Open all in VS Code simultaneously
- Single `.git` folder (efficient storage)

---

## Workflow: Fixing Backend Code

### Scenario: Fix bug in `auth.controller.ts`

```bash
# 1. Make fix on main branch
cd project_1_base
git checkout main
# Fix bug in backend/src/controllers/auth.controller.ts
git add backend/
git commit -m "Fix password validation bug"

# 2. Apply ONLY backend fix to cypress
cd ../project_2_cypress
git checkout cypress
git cherry-pick <commit-hash>
# Result: Cypress gets backend fix, no Playwright code bleeds in

# 3. Apply ONLY backend fix to playwright
cd ../project_3_playwright
git checkout playwright
git cherry-pick <commit-hash>
# Result: Playwright gets backend fix, no Cypress code bleeds in
```

---

## Preventing Framework Cross-Contamination

### Branch Creation (Do Once)

```bash
# Create cypress branch from main
git checkout main
git checkout -b cypress
# Add only Cypress files
git add cypress/ cypress.config.ts package.json
git commit -m "Add Cypress E2E tests"

# Create playwright branch from main (NOT from cypress)
git checkout main  # � Back to main first
git checkout -b playwright
# Add only Playwright files
git add tests/ playwright.config.ts package.json
git commit -m "Add Playwright E2E tests"
```

**Key:** Both E2E branches diverge from `main`, not from each other.

---

## Keeping Branches in Sync

### Option A: Cherry-Pick (Surgical Precision)

**Use when:** Specific backend/docs fixes only

```bash
# On main: commit backend fix
git commit -m "Fix: Auth controller validation"  # abc123

# Apply to cypress
git checkout cypress
git cherry-pick abc123  # ONLY this commit

# Apply to playwright
git checkout playwright
git cherry-pick abc123  # ONLY this commit
```

**Result:** Backend fix propagated, E2E code stays isolated.

---

### Option B: Merge Main (Batch Updates)

**Use when:** Multiple backend changes accumulated

```bash
# On cypress branch
git checkout cypress
git merge main  # Brings all main commits since last merge

# On playwright branch
git checkout playwright
git merge main  # Brings all main commits since last merge
```

**Safe because:**
- `main` has no E2E code
- `cypress` only has Cypress code
- `playwright` only has Playwright code
- No overlap = no conflicts

---

## File Structure Per Branch

**main:**
```
backend/
frontend/
package.json         # No E2E dependencies
```

**cypress:**
```
backend/             # Same as main
frontend/            # Same as main
cypress/             # Cypress-only
cypress.config.ts    # Cypress-only
package.json         # + cypress dependency
```

**playwright:**
```
backend/             # Same as main
frontend/            # Same as main
tests/               # Playwright-only
playwright.config.ts # Playwright-only
package.json         # + @playwright/test dependency
```

---

## Daily Workflow

### Working on Backend

```bash
# Always work on main branch
cd project_1_base
# Make changes, commit
git commit -m "Add new todo filter feature"

# Sync to E2E branches
cd ../project_2_cypress
git cherry-pick <commit>

cd ../project_3_playwright
git cherry-pick <commit>
```

### Working on E2E Tests

```bash
# Work directly in respective worktree
cd project_2_cypress
# Add/modify Cypress tests
git commit -m "Add auth E2E tests"

# No need to sync - Cypress code stays isolated
```

### Viewing Other Branch (Read-Only)

```bash
# Working in project_2_cypress
# Want to reference Playwright syntax
code ../project_3_playwright  # Open in new VS Code window
# View side-by-side, no switching needed
```

---

## Why This Works

**No Cross-Contamination:**
- `main` � `cypress`: Only main code merged
- `main` � `playwright`: Only main code merged
- `cypress` ` `playwright`: Never merge between them

**Isolation:**
- Cypress code lives only in `cypress` branch
- Playwright code lives only in `playwright` branch
- Shared code (backend) lives in all branches

**Cherry-Pick Safety:**
```bash
# Commit on main affects:
backend/src/controllers/auth.controller.ts   Safe to cherry-pick

# Commit on cypress affects:
cypress/e2e/auth.cy.ts  L Don't cherry-pick to playwright

# Commit on playwright affects:
tests/auth.spec.ts  L Don't cherry-pick to cypress
```

---

## Comparison Workflow

### View Framework Differences

```bash
# What files differ between Cypress and Playwright?
git diff cypress..playwright --name-only

# Compare specific file
git diff cypress:package.json playwright:package.json

# Show Cypress test
git show cypress:cypress/e2e/auth.cy.ts

# Show Playwright test
git show playwright:tests/auth.spec.ts
```

---

## Worktree Management

```bash
# List all worktrees
git worktree list

# Remove worktree (doesn't delete branch)
git worktree remove ../project_2_cypress

# Recreate worktree later
git worktree add ../project_2_cypress cypress

# Prune stale worktrees
git worktree prune
```

---

## Quick Reference

| Task | Command |
|------|---------|
| **Backend fix** | `main` � commit � cherry-pick to both E2E branches |
| **Cypress test** | Work in `project_2_cypress`, commit, done |
| **Playwright test** | Work in `project_3_playwright`, commit, done |
| **View other branch** | Open worktree folder in new VS Code window |
| **Sync backend** | `git cherry-pick <commit>` OR `git merge main` |

---

## Learning Outcomes

- Git branching strategies
- Cherry-picking for selective sync
- Worktrees for parallel development
- Preventing merge conflicts via isolation
- Real-world monorepo patterns

---

## Summary

**Strategy:** Branches + Worktrees = Best of both worlds

- **Branches:** Clean separation, Git-managed
- **Worktrees:** Parallel access, no switching
- **Cherry-pick:** Surgical backend sync
- **Isolation:** E2E frameworks never mix

**Result:** Learn Git while maintaining clean testing stack separation.
