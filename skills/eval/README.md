# Skill eval

Measures whether the generated skill actually changes how an agent behaves.
The deterministic tests in `../tests/` check that the skill is well formed;
this checks that it works.

## This is a local step, not a CI job

Deliberately. It has no nx target and no CI wiring, because step 3 below
cannot be automated here: it needs an agent runner driving eight or more
workspaces, which means an API key and a per-run cost. Running it is a
manual exercise a maintainer does when changing the skill, not something
that gates a pull request.

What that costs you: nothing verifies these files still work as the code
around them moves. `grade.ts` and `run-grading.ts` are covered by unit
tests in `../tests/grade.spec.ts`, so the scoring cannot silently rot, but
the end-to-end path is only exercised when someone runs it.

Worth running when you change `SKILL.md`, change what the validator
reports, or change the rules in the MCP registries the skill is generated
from. Not worth running for a docs tweak.

## Running it

```bash
# 1. Build the CLI. The eval grades against the published artifact, not source.
nx build dynamic-forms-cli

# 2. Materialise one workspace per task per trial.
node skills/eval/setup-workspaces.ts /tmp/skill-trials 2

# 3. Run an agent in each workspace with that task's prompt, from tasks.ts.
#    Each workspace is independent; do not reuse one agent across trials.

# 4. Grade, only once every agent has finished.
node skills/eval/run-grading.ts /tmp/skill-trials
```

Add `--no-skill` at step 2 to build the baseline arm. A pass rate on its own
means nothing without it: it cannot distinguish a skill that works from a task
the model would have got right anyway.

Last run, 2026-08-18: with the skill, 8 of 8 tasks passed every trial across
two trials each. Against a no-skill baseline on four of those tasks, the
agents still produced valid configs every time; what separated the arms was
that two of four baseline runs never invoked the validator. So the measured
effect was on verification behaviour, not on config correctness.

## What is measured, and how much to trust it

| Grader           | Weight | Signal                                                                       |
| ---------------- | ------ | ---------------------------------------------------------------------------- |
| `config-valid`   | 3      | Objective. The produced file is re-validated by the built CLI                |
| `ran-validator`  | 2      | Objective. Read from a log a wrapper writes, which the agent never sees       |
| `required-content` | 1    | Objective. Substring checks against the produced file                        |
| `forbidden-content` | 1   | Objective. The specific mistake a task probes for                            |
| `triggered`      | 1      | Self-reported, and omitted entirely when no transcript is available          |

Results aggregate to **pass^k** as well as pass@k. A skill that works four
times in five is not working, and only pass^k shows that.

## Known limitations

Worth reading before believing a number from this harness.

- **Triggering is barely measured.** A subagent's full transcript is not
  available, so the trigger grader falls back to the agent's own account of
  itself, and is omitted when even that is missing. Discovery, which the
  literature identifies as the dominant failure mode for skills, is the thing
  this harness measures least well.
- **The baseline arm is contaminated.** Each workspace lists the CLI in
  `devDependencies` and has it in `node_modules`, so a no-skill agent can find
  the validator without the skill telling it to. That inflates the baseline's
  `ran-validator` score. Removing the hint would make the comparison sharper.
- **Grading races the agents.** Grading a run before its agents finish scores
  their trials as failures. `run-grading` warns about workspaces that look
  untouched, but the warning is a heuristic, not a barrier.
- **Small samples.** Two trials per task is enough to catch a coin-flip, not
  enough to estimate a rate.
- **One model.** Anthropic recommends testing across Haiku, Sonnet and Opus,
  since a skill that reads as over-explained to one may be too terse for
  another. This harness runs whatever model the agent runner uses.
