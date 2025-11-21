#!/bin/bash

# Script to patch @angular/build version compatibility check
# This is a workaround for using Angular 21 with @ng-doc/builder which only supports Angular 20

echo "🔧 Patching @angular/build version compatibility check..."

# Find all @angular/build version.js files that contain the version check
VERSION_FILES=$(find node_modules -name "version.js" -path "*/@angular/build/src/utils/*" -exec grep -l "supports Angular versions" {} \; 2>/dev/null)

if [ -z "$VERSION_FILES" ]; then
  echo "❌ No @angular/build version files found to patch"
  exit 1
fi

PATCHED_COUNT=0

for file in $VERSION_FILES; do
  echo "📝 Patching: $file"
  
  # Check if already patched
  if grep -q "Skip version check for Angular 21 compatibility" "$file"; then
    echo "✅ Already patched: $file"
    continue
  fi
  
  # Apply patch: add early return to skip version check
  sed -i.backup 's/function assertCompatibleAngularVersion(projectRoot) {/function assertCompatibleAngularVersion(projectRoot) {\
    return; \/\/ Skip version check for Angular 21 compatibility/' "$file"
  
  # Verify patch was applied
  if grep -q "Skip version check for Angular 21 compatibility" "$file"; then
    echo "✅ Successfully patched: $file"
    PATCHED_COUNT=$((PATCHED_COUNT + 1))
    # Remove backup file
    rm -f "$file.backup"
  else
    echo "❌ Failed to patch: $file"
    # Restore from backup if patch failed
    if [ -f "$file.backup" ]; then
      mv "$file.backup" "$file"
    fi
  fi
done

if [ $PATCHED_COUNT -gt 0 ]; then
  echo "🎉 Successfully patched $PATCHED_COUNT @angular/build version files"
  echo "ℹ️  This allows Angular 21 to work with @ng-doc/builder"
else
  echo "⚠️  No files were patched"
fi

echo "✨ Patch script completed"