# Recursive Test Quality Improvement Protocol

## Overview

This is a **self-driving, iterative protocol** that continuously improves test quality until excellence is achieved. The prompt runs in cycles, each time assessing, fixing, and re-assessing until quality targets are met.

## Quality Targets (Stop Conditions)

The recursion stops when ALL targets are met:

- ✅ **Test Health Score: ≥ 90/100**
- ✅ **Fake Passing Tests: 0**
- ✅ **Critical Logic Gaps: 0**
- ✅ **High Priority Uncovered Scenarios: < 5**
- ✅ **Integration Coverage: ≥ 80%**
- ✅ **Weak Assertions: 0**
- ✅ **All Tests Pass: 100%**
- ✅ **No Flaky Tests: 0 failures in 3 runs**

## Iteration Tracking

Create a file `test-improvement-log.json`:
```json
{
  "iterations": [],
  "currentIteration": 0,
  "startDate": "2025-11-05",
  "targets": {
    "healthScore": { "target": 90, "current": 0 },
    "fakePassingTests": { "target": 0, "current": 0 },
    "logicGaps": { "target": 0, "current": 0 },
    "weakAssertions": { "target": 0, "current": 0 }
  }
}
```

---

## 🔄 THE RECURSIVE PROMPT

Copy and execute this entire prompt. At the end of each iteration, the prompt will tell you to run it again with updated context, or declare success.

---

## ITERATION PROMPT: Start Here

```markdown
# Test Quality Improvement - Iteration {{ITERATION_NUMBER}}

## Context from Previous Iteration
{{PREVIOUS_ITERATION_SUMMARY}}

## Current Quality Metrics
{{CURRENT_METRICS}}

---

## YOUR TASK: Execute This Iteration

### Phase 1: Assess Current State (10 minutes)

**1.1 Run Tests and Collect Metrics**
```bash
# Run all tests and capture results
nx run dynamic-form:test --coverage > iteration-{{N}}-test-output.txt 2>&1
nx run dynamic-form-material:test --coverage >> iteration-{{N}}-test-output.txt 2>&1

# Analyze test output
grep -E "(PASS|FAIL)" iteration-{{N}}-test-output.txt | wc -l
```

**1.2 Identify Top 5 Issues**

Scan ALL spec files for these patterns (use automated search):

```bash
# Find weak assertions
grep -r "toBeDefined()" packages/dynamic-form*/src --include="*.spec.ts" | tee iteration-{{N}}-weak-assertions.txt

# Find toBeTruthy/toBeFalsy without context
grep -r "toBeTruthy()\|toBeFalsy()" packages/dynamic-form*/src --include="*.spec.ts" | tee iteration-{{N}}-weak-boolean.txt

# Find tests without assertions
grep -r "it(" packages/dynamic-form*/src --include="*.spec.ts" -A 10 | grep -v "expect\|assert" | tee iteration-{{N}}-no-assertions.txt

# Find missing error handling tests
grep -r "try\|catch\|throw" packages/dynamic-form*/src --include="*.ts" --exclude="*.spec.ts" | wc -l
grep -r "catch\|error" packages/dynamic-form*/src --include="*.spec.ts" | wc -l
# Compare counts - if implementation has more error handling than tests, there's a gap

# Find async tests without proper waiting
grep -r "async.*it(" packages/dynamic-form*/src --include="*.spec.ts" -A 5 | grep "detectChanges()" | grep -v "await" | tee iteration-{{N}}-async-issues.txt
```

**1.3 Analyze One Critical File in Detail**

Pick the file with the most issues. Read it and analyze:
- Count weak assertions
- Identify logic gaps
- Find uncovered edge cases
- List fake passing tests

**1.4 Calculate Quality Score**

```typescript
// Quality scoring formula
const healthScore = {
  testCoverage: (passedTests / totalTests) * 20,  // Max 20 points
  assertionQuality: (strongAssertions / totalAssertions) * 25,  // Max 25 points
  edgeCoverage: (edgeCaseTests / requiredEdgeCases) * 20,  // Max 20 points
  integrationCoverage: (integrationTests / requiredIntegrations) * 20,  // Max 20 points
  noFakeTests: (fakeTests === 0 ? 15 : 0)  // Max 15 points
};

const totalScore = Object.values(healthScore).reduce((a, b) => a + b, 0);
```

---

### Phase 2: Fix Top 5 Issues (30-45 minutes)

**Priority Order:**
1. Fake passing tests (highest risk)
2. Critical logic gaps
3. Missing error handling
4. Weak assertions
5. Uncovered edge cases

**For Each Issue:**

1. **Read the test file**
2. **Identify the specific problem**
3. **Fix it with proper implementation**
4. **Verify the fix**
5. **Document the change**

**Example Fix Template:**

```typescript
// ❌ BEFORE (Iteration {{N}})
it('should update form value', () => {
  component.value.set({ firstName: 'Jane' });
  expect(component.formValue()).toBeDefined(); // FAKE PASSING - always true
});

// ✅ AFTER (Iteration {{N+1}})
it('should update form value when external value changes', async () => {
  // Arrange
  const initialValue = { firstName: 'John' };
  const newValue = { firstName: 'Jane' };

  fixture.componentRef.setInput('value', initialValue);
  await delay();
  fixture.detectChanges();

  expect(component.formValue()).toEqual(initialValue);

  // Act
  fixture.componentRef.setInput('value', newValue);
  await delay();
  fixture.detectChanges();

  // Assert
  expect(component.formValue()).toEqual(newValue);
  expect(component.formValue().firstName).toBe('Jane');
});
```

**For each fix, add a comment:**
```typescript
// FIXED: Iteration {{N}} - Replaced weak assertion with specific value check
```

---

### Phase 3: Verify Improvements (5 minutes)

**3.1 Run Tests**
```bash
nx run dynamic-form:test
nx run dynamic-form-material:test
```

**3.2 Verify All Tests Pass**
- If tests fail, fix them before proceeding
- Document any test failures and their resolution

**3.3 Re-run Metrics Collection**
```bash
# Re-run Phase 1.2 automated searches
# Compare before/after counts
```

**3.4 Calculate New Quality Score**
- Use same formula from Phase 1.4
- Compare to previous iteration

---

### Phase 4: Document Iteration Results

Create file: `iteration-{{N}}-summary.md`

```markdown
# Iteration {{N}} Summary

## Date: {{DATE}}
## Duration: {{DURATION}}

### Starting Metrics
- Health Score: {{PREVIOUS_SCORE}}/100
- Fake Passing Tests: {{PREVIOUS_FAKE_COUNT}}
- Weak Assertions: {{PREVIOUS_WEAK_COUNT}}
- Test Pass Rate: {{PREVIOUS_PASS_RATE}}%

### Issues Fixed This Iteration
1. **[File: spec-file.spec.ts:123]**
   - Issue: Weak assertion using toBeDefined()
   - Fix: Added specific value assertion
   - Impact: Caught bug where value was undefined object

2. **[File: another.spec.ts:456]**
   - Issue: Missing null handling test
   - Fix: Added edge case test for null input
   - Impact: Improved edge case coverage by 5%

[... list all 5 fixes ...]

### Ending Metrics
- Health Score: {{NEW_SCORE}}/100 (**+{{DELTA}}**)
- Fake Passing Tests: {{NEW_FAKE_COUNT}} (**{{DELTA}}**)
- Weak Assertions: {{NEW_WEAK_COUNT}} (**{{DELTA}}**)
- Test Pass Rate: {{NEW_PASS_RATE}}% (**+{{DELTA}}%**)

### Files Modified
- packages/dynamic-form/src/lib/dynamic-form.component.spec.ts
- packages/dynamic-form/src/lib/core/expressions/condition-evaluator.spec.ts
[... list all modified files ...]

### Commits Made
- `git commit -m "test: iteration {{N}} - fix fake passing tests in DynamicForm"`
- `git commit -m "test: iteration {{N}} - add null handling edge cases"`

### Quality Targets Progress
- [{{STATUS}}] Health Score: {{CURRENT}}/90 ({{PERCENT}}%)
- [{{STATUS}}] Fake Passing: {{CURRENT}}/0
- [{{STATUS}}] Logic Gaps: {{CURRENT}}/0
- [{{STATUS}}] Weak Assertions: {{CURRENT}}/0

### Next Iteration Focus
{{TOP_3_REMAINING_ISSUES}}
```

---

### Phase 5: Commit Changes

```bash
# Stage all changes
git add .

# Commit with detailed message
git commit -m "test: iteration {{N}} - improve test quality

Fixed:
- {{ISSUE_1}}
- {{ISSUE_2}}
- {{ISSUE_3}}
- {{ISSUE_4}}
- {{ISSUE_5}}

Metrics:
- Health score: {{PREV}} → {{NEW}} (+{{DELTA}})
- Fake passing tests: {{PREV}} → {{NEW}}
- Test pass rate: {{PREV}}% → {{NEW}}%

Iteration {{N}}/estimated {{TOTAL}}"

# Push changes
git push
```

---

### Phase 6: Decision Point - Continue or Complete?

**Calculate Progress:**
```javascript
const progress = {
  healthScore: currentScore >= 90,
  fakeTests: fakeTestCount === 0,
  logicGaps: criticalGaps === 0,
  weakAssertions: weakAssertionCount === 0,
  integration: integrationCoverage >= 80,
  allPass: testPassRate === 100
};

const allTargetsMet = Object.values(progress).every(v => v === true);
```

**If `allTargetsMet === true`:**

```markdown
## 🎉 SUCCESS - ALL QUALITY TARGETS MET!

### Final Metrics
- Health Score: {{SCORE}}/100 ✅
- Fake Passing Tests: 0 ✅
- Logic Gaps: 0 ✅
- Weak Assertions: 0 ✅
- Integration Coverage: {{PERCENT}}% ✅
- Test Pass Rate: 100% ✅

### Total Iterations: {{N}}
### Total Time Invested: {{HOURS}} hours
### Total Issues Fixed: {{COUNT}}

### Summary of All Changes
[Generate comprehensive report of all iterations]

### Recommendations for Maintenance
1. Add pre-commit hooks to prevent weak assertions
2. Require integration tests for new features
3. Set up mutation testing
4. Run quarterly quality assessments

## RECURSION COMPLETE - No further iterations needed! 🚀
```

**If `allTargetsMet === false`:**

```markdown
## 🔄 CONTINUE - Proceed to Next Iteration

### Current Progress
- Health Score: {{SCORE}}/90 ({{PERCENT}}% to goal)
- Remaining Issues: {{COUNT}}
- Estimated Iterations Remaining: {{ESTIMATE}}

### Top Priorities for Next Iteration
1. {{ISSUE_1}}
2. {{ISSUE_2}}
3. {{ISSUE_3}}
4. {{ISSUE_4}}
5. {{ISSUE_5}}

### Iteration Statistics
- Completed: {{N}}
- Success Rate: {{PERCENT}}% improvement per iteration
- Projected Completion: {{ESTIMATED_ITERATIONS}} more iterations

---

## ▶️ NEXT ACTION: Run This Prompt Again

**Update the context section with:**
- Iteration number: {{N+1}}
- Previous summary: [Copy iteration-{{N}}-summary.md]
- Current metrics: [Copy ending metrics]

**Then execute all 6 phases again.**

The recursion continues until all quality targets are met.
```

---

## End of Iteration Prompt

Save this iteration's results and either:
1. **CONTINUE**: Update context and run the prompt again
2. **COMPLETE**: Celebrate success and document learnings

---
```

---

## 🚀 How to Execute This Recursive Protocol

### Initial Setup (One Time)

```bash
# 1. Create tracking directory
mkdir -p test-improvement-iterations

# 2. Initialize log
cat > test-improvement-log.json <<EOF
{
  "startDate": "$(date +%Y-%m-%d)",
  "iterations": [],
  "currentIteration": 0,
  "targetsMet": false
}
EOF

# 3. Establish baseline
nx run dynamic-form:test --coverage > baseline-test-results.txt
nx run dynamic-form-material:test --coverage >> baseline-test-results.txt
```

### Iteration 1 (First Run)

```bash
# Copy the ITERATION PROMPT above
# Replace {{ITERATION_NUMBER}} with 1
# Replace {{PREVIOUS_ITERATION_SUMMARY}} with "Initial assessment - baseline"
# Replace {{CURRENT_METRICS}} with baseline results
# Execute all 6 phases
```

### Iteration 2+ (Recursive Runs)

After completing Iteration N:
1. Copy iteration-N-summary.md content
2. Run the ITERATION PROMPT again
3. Replace {{ITERATION_NUMBER}} with N+1
4. Replace {{PREVIOUS_ITERATION_SUMMARY}} with iteration-N-summary.md
5. Replace {{CURRENT_METRICS}} with ending metrics from iteration N
6. Execute all 6 phases

**Repeat until Phase 6 declares SUCCESS**

---

## 🎯 Optimization Strategies

### Parallel Processing
After iteration 3, if progress is steady, you can parallelize:
- **Track A**: Fix component tests (iterations on dynamic-form)
- **Track B**: Fix Material tests (iterations on dynamic-form-material)
- Merge after both reach targets

### Batch Iterations
For large test suites, batch similar fixes:
- **Iteration N**: Fix ALL weak assertions across all files
- **Iteration N+1**: Fix ALL missing edge cases
- **Iteration N+2**: Add ALL integration tests

### Focus Iterations
Target specific components:
- **Iteration 1-3**: Core DynamicForm component only
- **Iteration 4-6**: Material fields only
- **Iteration 7-9**: Utilities only
- **Iteration 10**: Integration tests

---

## 📊 Progress Visualization

Create a dashboard file: `progress-dashboard.md`

```markdown
# Test Quality Improvement Dashboard

## Overall Progress: {{PERCENT}}%

[█████████░░░░░░░░░░] 45% Complete

## Metrics Over Time

| Iteration | Health Score | Fake Tests | Weak Assertions | Pass Rate | Duration |
|-----------|-------------|------------|-----------------|-----------|----------|
| Baseline  | 45/100      | 23         | 156             | 87%       | -        |
| 1         | 52/100      | 18         | 134             | 89%       | 45min    |
| 2         | 61/100      | 12         | 98              | 92%       | 40min    |
| 3         | 69/100      | 7          | 67              | 95%       | 35min    |
| **Target**| **90/100**  | **0**      | **0**           | **100%**  | -        |

## Velocity
- Average improvement per iteration: +8.5 points
- Estimated iterations remaining: 3
- Projected completion date: 3 days

## Top Contributors to Quality
1. Fixed fake passing tests: +15 points
2. Added edge case coverage: +12 points
3. Improved assertions: +10 points
```

---

## 🛠️ Automated Helper Scripts

### Script 1: Run One Iteration

```bash
#!/bin/bash
# run-iteration.sh

ITERATION=$1

echo "Starting Iteration $ITERATION..."

# Phase 1: Assess
echo "Phase 1: Assessing current state..."
./assess-quality.sh > iteration-$ITERATION-assessment.txt

# Phase 2: Fix (manual with AI assistance)
echo "Phase 2: Ready for fixes. Press enter when fixes are complete..."
read

# Phase 3: Verify
echo "Phase 3: Verifying improvements..."
nx run dynamic-form:test > iteration-$ITERATION-test-results.txt
nx run dynamic-form-material:test >> iteration-$ITERATION-test-results.txt

# Phase 4: Document
echo "Phase 4: Generating summary..."
./generate-summary.sh $ITERATION

# Phase 5: Commit
echo "Phase 5: Committing changes..."
git add .
git commit -m "test: iteration $ITERATION quality improvements"

# Phase 6: Check if done
echo "Phase 6: Checking targets..."
./check-targets.sh

echo "Iteration $ITERATION complete!"
```

### Script 2: Assess Quality

```bash
#!/bin/bash
# assess-quality.sh

echo "=== Quality Assessment ==="

echo "Fake Passing Tests:"
grep -r "toBeDefined()" packages/dynamic-form*/src --include="*.spec.ts" | wc -l

echo "Weak Boolean Assertions:"
grep -r "toBeTruthy()\|toBeFalsy()" packages/dynamic-form*/src --include="*.spec.ts" | wc -l

echo "Async Issues:"
grep -r "async.*it(" packages/dynamic-form*/src --include="*.spec.ts" -A 5 | grep "detectChanges()" | grep -v "await" | wc -l

echo "Test Pass Rate:"
nx run dynamic-form:test 2>&1 | grep -E "Tests.*passed" || echo "0%"
```

### Script 3: Check Targets

```bash
#!/bin/bash
# check-targets.sh

FAKE_TESTS=$(grep -r "toBeDefined()" packages/dynamic-form*/src --include="*.spec.ts" | wc -l)
WEAK_ASSERTIONS=$(grep -r "toBeTruthy()\|toBeFalsy()" packages/dynamic-form*/src --include="*.spec.ts" | wc -l)

if [ $FAKE_TESTS -eq 0 ] && [ $WEAK_ASSERTIONS -eq 0 ]; then
  echo "🎉 ALL TARGETS MET - RECURSION COMPLETE!"
  exit 0
else
  echo "🔄 CONTINUE - $FAKE_TESTS fake tests, $WEAK_ASSERTIONS weak assertions remaining"
  exit 1
fi
```

---

## 🎓 Learning from Each Iteration

After each iteration, document:

### What Worked Well
- Which fixes had biggest impact?
- Which patterns repeated?
- What was faster than expected?

### What Was Challenging
- Which tests were hard to fix?
- Where did we need domain expertise?
- What took longer than estimated?

### Insights Gained
- What test smells did we discover?
- What patterns should we avoid?
- What standards should we enforce?

---

## 🏁 Success Criteria Reminder

The recursion stops when:
- ✅ Health Score ≥ 90/100
- ✅ Zero fake passing tests
- ✅ Zero critical logic gaps
- ✅ Zero weak assertions
- ✅ 100% test pass rate
- ✅ ≥80% integration coverage
- ✅ No flaky tests (3 consecutive passes)

**Keep iterating until all criteria are met!**

---

## 🔄 Meta-Recursion Note

If after 10 iterations targets aren't met, add this meta-iteration:

**Iteration 10+: Strategy Reassessment**
1. Review all previous iterations
2. Identify diminishing returns
3. Adjust targets if needed (be realistic)
4. Consider if some issues need architecture changes
5. Update priority order
6. Continue with refined strategy

---

**Ready to start? Run Iteration 1 now! 🚀**
