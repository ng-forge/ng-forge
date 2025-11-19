#!/bin/bash

# Script to update all test spec files to use their corresponding test routes

E2E_DIR="apps/examples/material/e2e/src"

# Array of test spec files (excluding array-fields which is already done)
TEST_SPECS=(
  "advanced-validation"
  "age-based-logic-test"
  "async-validation"
  "comprehensive-field-tests"
  "conditional-fields-test"
  "cross-field-validation"
  "cross-page-validation"
  "debug-test"
  "demo-scenarios-test"
  "error-handling"
  "essential-tests"
  "expression-based-logic"
  "form-reset-clear"
  "material-components"
  "multi-page-navigation"
  "navigation-edge-cases"
  "scenario-list"
  "user-journey-flows"
  "user-workflows"
)

for spec in "${TEST_SPECS[@]}"; do
  spec_file="$E2E_DIR/${spec}.spec.ts"

  if [ -f "$spec_file" ]; then
    # Update the goto URL to use the specific test route
    sed -i.bak "s|await page.goto('http://localhost:4200/e2e-test')|await page.goto('http://localhost:4200/test/${spec}')|g" "$spec_file"
    rm "${spec_file}.bak" 2>/dev/null
    echo "Updated: ${spec}.spec.ts"
  else
    echo "Warning: ${spec}.spec.ts not found"
  fi
done

echo ""
echo "All test specs updated!"
