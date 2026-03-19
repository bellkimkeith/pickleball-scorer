# GitFlow Workflow Guide

## Branch Structure
```
main        - Production-ready code (tagged releases)
develop     - Integration branch for features
feature/*   - Individual feature branches
release/*   - Release preparation branches
hotfix/*    - Emergency production fixes
```

## Daily Development Workflow

### Start a new feature:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Complete a feature:
```bash
git checkout develop
git merge --no-ff feature/your-feature-name
git branch -d feature/your-feature-name
git push origin develop
```

## Release Workflow (App Store)

### 1. Prepare release:
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0
```

### 2. Final testing and fixes on release branch

### 3. Jenkins auto-detects version from git tag (must exist on commit):
- Tag format: `v1.2.0`
- Jenkins parses tag, updates `app.json`: `version`, `ios.buildNumber=1`, `android.versionCode`

### 4. Build with Jenkins:
- Go to Jenkins → New Build
- BRANCH: `main` (version from git tag, not branch)
- BUILD_TYPE: `production`
- DISTRIBUTION: `appstore` (or `testflight` for testing)

### 5. After successful build, merge to main and tag:
```bash
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0 - Your release notes"
git push origin main --tags
```

### 6. Sync develop:
```bash
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop
```

## Version Numbering (Semantic Versioning)
- **MAJOR**: Breaking changes (new API, removed features)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Hotfix Workflow
```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-bug
# Make fixes
git checkout main
git merge --no-ff hotfix/fix-critical-bug
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin main --tags
git checkout develop
git merge --no-ff hotfix/fix-critical-bug
git push origin develop
```
