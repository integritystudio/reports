# Claude Code Skill (Slash Command): review-and-commit.md

**Category:** General
**For Developers:** False
**Contributor:** DoguD
**Type:** STRUCTURED

## Prompt

---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Review the existing changes and then create a git commit following the conventional commit format. If you think there are more than one distinct change you can create multiple commits.

---
*Source: [prompts.chat](https://prompts.chat) | License: CC0 1.0 (Public Domain)*
