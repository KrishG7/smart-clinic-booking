# Git Commands Cheatsheet — Smart Clinic Booking

## Essential Commands for Team Members

### Setup (One-time)
```bash
# Clone the repository
git clone https://github.com/KrishG7/smart-clinic-booking.git
cd smart-clinic-booking

# Set your identity
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### Daily Workflow
```bash
# 1. Always pull latest changes before starting work
git pull origin main

# 2. Check what files you've changed
git status

# 3. See exact changes line-by-line
git diff

# 4. Add your changed files
git add <filename>          # Add specific file
git add .                   # Add all changes

# 5. Commit with a meaningful message
git commit -m "feat: add patient registration API endpoint"

# 6. Push to remote
git push origin main
```

### Branch Workflow (for features)
```bash
# Create and switch to a new branch
git branch feature-name
git checkout feature-name
# OR shortcut:
git switch -c feature-name

# After finishing work, merge back
git checkout main
git merge feature-name

# Delete branch after merge
git branch -d feature-name
```

### Useful Commands
```bash
# View commit history
git log --oneline -10

# Undo last commit (keep changes)
git revert HEAD

# Restore a file to last commit version
git restore <filename>

# Remove a file from tracking
git rm --cached <filename>

# Fetch updates without merging
git fetch origin
```

### Commit Message Format
Use meaningful, descriptive commit messages:
```
feat: add booking API endpoint
fix: resolve token queue ordering bug
docs: update README with API documentation
style: improve dashboard responsive layout
refactor: extract auth middleware
test: add health check test
chore: update dependencies
```

## Important Notes
- **Never force push** to main branch
- **Always pull** before starting work
- **Small, focused commits** — each commit = one logical change
- **Meaningful messages** — reviewers will check commit quality
