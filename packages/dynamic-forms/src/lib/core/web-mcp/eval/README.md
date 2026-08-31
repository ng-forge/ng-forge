# WebMCP eval

Measures whether an agent can actually drive a form through the registered
tools. The suites in `../` check the contract: given these arguments, the form
does this. They cannot check tool selection or schema comprehension, which are
model behaviour rather than page behaviour, and are the failure modes Chrome's
own [guidance](https://developer.chrome.com/docs/ai/webmcp/best-practices) says
to cover with evals.

## This is a local step, not a CI job

Deliberately, and for the same reason as `skills/eval`: it needs an agent
driving a browser, which means an API key and a per-run cost. It is a manual
exercise a maintainer does when changing the tool descriptions, the schema
shape, or the wording of the responses. It does not gate a pull request.

The graders are pure functions with unit tests in `grade.spec.ts`, so the
scoring cannot silently rot. The end-to-end path is only exercised when someone
runs it.

Worth running when you change a tool's `description`, change what a response
says, or change how the schema describes options and constraints. Not worth
running for an internal refactor that leaves all three alone.

## Running it

```bash
# 1. Serve the example app the tasks point at.
nx run core-examples:build
nx run core-examples:serve-static --port 4205
```

2. Open the task's scenario in a browser with WebMCP available (Chrome 149+
   with the origin trial or `chrome://flags/#web-machine-learning-model-context`,
   on a cross-origin isolated document). Routes are
   `http://localhost:4205/#/test/web-mcp/{scenario}`, with `scenario` taken from
   the task.

3. Install the recorder before the page registers anything, so every call is
   captured. It wraps `registerTool` rather than replacing the model context, so
   the real agent still sees real tools:

   ```js
   (() => {
     const calls = [];
     window.__mcpEval = { calls, export: () => JSON.stringify(calls) };
     const context = document.modelContext;
     const original = context.registerTool.bind(context);
     context.registerTool = (tool, options) =>
       original(
         {
           ...tool,
           execute: async (args, client) => {
             const result = await tool.execute(args, client);
             calls.push({ tool: tool.name, args, result: String(result), at: Date.now() });
             return result;
           },
         },
         options,
       );
   })();
   ```

4. Give the agent the task's `prompt`, verbatim, and nothing else. Do not tell
   it which tool to use: whether it finds one is what `discovery` measures.

5. When it stops, collect the transcript and the form's final value, then grade:

   ```js
   const transcript = {
     taskId: 'discovery',
     calls: window.__mcpEval.calls,
     finalValue: /* the form value, read from the page */,
   };
   ```

   ```ts
   import { EVAL_TASKS } from './tasks';
   import { gradeTask, summarise } from './grade';

   const results = transcripts.map((t) =>
     gradeTask(
       EVAL_TASKS.find((task) => task.id === t.taskId)!,
       t,
     ),
   );
   console.log(summarise(results));
   ```

Run each task at least twice. One trial cannot tell a working tool surface from
a lucky one.

## What is measured

| Grader          | Weight | Signal                                                           |
| --------------- | ------ | ---------------------------------------------------------------- |
| `final-value`   | 3      | Objective. The form's own value, which only the tools can change |
| `tools-used`    | 2      | Objective. Read from the recorder, which the agent never sees    |
| `tools-avoided` | 2      | Objective. Same recorder. The negative control                   |
| `recovery`      | 1      | Objective. A refused response followed by one that lands         |
| `call-economy`  | 1      | Objective. Call count against the task's budget                  |

A task passes at a weighted score of 0.8 or above. Results aggregate to
**pass^k** as well as pass@k, because a surface an agent drives correctly four
times in five is not one that works, and only the every-trial figure shows that.

## The tasks

| Task                          | Probes                                                                |
| ----------------------------- | --------------------------------------------------------------------- |
| `discovery`                   | Does the agent reach for the tool at all, or type into the DOM        |
| `partial-completion`          | Two partial calls, where the second must not clobber the first        |
| `correction-after-validation` | Does it read a validation error out of the response and fix it        |
| `conditional-fields`          | A field that does not apply until another value is set                |
| `opaque-select-values`        | Choosing a machine value it can only map from the option's label      |
| `submission-not-offered`      | Negative control: with no submit tool, it must not claim to have paid |

## Known limitations

Worth reading before believing a number from this harness.

- **The recorder sits between the agent and the tool.** It wraps `execute`,
  so a bug in the wrapper looks like a bug in the tool. It is small and it does
  not touch arguments, but it is not nothing.
- **`finalValue` is collected by hand.** Nothing checks that the value pasted
  into the transcript is the value the form actually held.
- **Discovery is measured weakly.** `tools-used` shows that a tool was called,
  not that the agent chose it over an alternative it also considered. An agent
  told to use WebMCP scores the same as one that found the tools itself.
- **Small samples.** Two trials per task catches a coin flip. It does not
  estimate a rate.
- **One model, one browser.** A tool description that reads as over-explained to
  one model may be too terse for another, and the origin trial is Chrome-only,
  so there is no cross-browser signal to have.
- **Never run.** These tasks and graders are written but have no recorded
  baseline yet. Treat the first run as establishing one, not as a regression
  check.
