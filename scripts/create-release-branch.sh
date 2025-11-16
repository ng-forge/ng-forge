#!/bin/bash

# Script to create a release branch from a specific commit
# Usage: ./scripts/create-release-branch.sh [patch|minor|major] [commit-hash]
# Example: ./scripts/create-release-branch.sh minor abc123

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed. Please install it first:"
    log_error "npm install -g pnpm@8.15.1"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    log_error "Not in a git repository"
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "Current version: $CURRENT_VERSION"

# Parse version bump type
VERSION_TYPE=${1:-"patch"}
COMMIT_HASH=${2:-"HEAD"}

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major|[0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    log_error "Invalid version type. Use: patch, minor, major, or specific version (e.g., 1.2.3)"
    exit 1
fi

# Resolve commit hash
COMMIT_HASH=$(git rev-parse "$COMMIT_HASH")
COMMIT_SHORT=$(git rev-parse --short "$COMMIT_HASH")
COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s" "$COMMIT_HASH")

log_info "Creating release from commit: $COMMIT_SHORT - $COMMIT_MESSAGE"

# Calculate new version
if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NEW_VERSION="$VERSION_TYPE"
else
    IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
    MAJOR=${VERSION_PARTS[0]}
    MINOR=${VERSION_PARTS[1]}
    PATCH=${VERSION_PARTS[2]}

    case "$VERSION_TYPE" in
        major)
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
            ;;
        minor)
            MINOR=$((MINOR + 1))
            PATCH=0
            ;;
        patch)
            PATCH=$((PATCH + 1))
            ;;
    esac

    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
fi

BRANCH_NAME="release-$NEW_VERSION"

log_info "New version will be: $NEW_VERSION"
log_info "Branch name: $BRANCH_NAME"

# Check if branch already exists
if git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
    log_error "Branch '$BRANCH_NAME' already exists!"
    exit 1
fi

# Confirm with user
echo ""
log_warning "Ready to create release branch with the following details:"
echo "  From commit: $COMMIT_SHORT ($COMMIT_MESSAGE)"
echo "  Version: $CURRENT_VERSION → $NEW_VERSION"
echo "  Branch: $BRANCH_NAME"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Cancelled by user"
    exit 0
fi

# Create branch from commit
log_info "Creating branch '$BRANCH_NAME' from $COMMIT_SHORT..."
git checkout -b "$BRANCH_NAME" "$COMMIT_HASH"
log_success "Branch created"

# Run nx release version to bump versions
log_info "Bumping version to $NEW_VERSION..."
if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    pnpm nx release version "$NEW_VERSION" --skip-publish
else
    pnpm nx release version "$VERSION_TYPE" --skip-publish
fi
log_success "Version bumped"

# Show changes
log_info "Changed files:"
git status --short

# Commit changes
log_info "Creating commit..."
git add .
git commit -m "chore: release v$NEW_VERSION"
log_success "Changes committed"

# Push branch
log_info "Pushing branch to origin..."
git push -u origin "$BRANCH_NAME"
log_success "Branch pushed"

echo ""
log_success "Release branch created successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "1. 🔍 Review the release branch:"
echo "   git checkout $BRANCH_NAME"
echo ""
echo "2. 🐛 Fix any issues in this branch (if needed)"
echo ""
echo "3. 🚀 Push to trigger the release workflow:"
echo "   git push origin $BRANCH_NAME"
echo ""
echo "   OR manually trigger the workflow in GitHub Actions:"
echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions/workflows/release.yml"
echo ""
echo "4. ✅ After release, apply any fixes to main branch as well"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
