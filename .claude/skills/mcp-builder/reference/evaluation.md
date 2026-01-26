# MCP Server Evaluation Guide

## Overview

This document provides guidance on creating comprehensive evaluations for MCP servers. Evaluations test whether LLMs can effectively use your MCP server to answer realistic, complex questions.

---

## Quick Reference

### Evaluation Requirements

- Create 10 human-readable questions
- Questions must be READ-ONLY, INDEPENDENT, NON-DESTRUCTIVE
- Each question requires multiple tool calls
- Answers must be single, verifiable values
- Answers must be STABLE (won't change over time)

### Output Format

```xml
<evaluation>
   <qa_pair>
      <question>Your question here</question>
      <answer>Single verifiable answer</answer>
   </qa_pair>
</evaluation>
```

---

## Purpose of Evaluations

The measure of quality of an MCP server is NOT how well the server implements tools, but how well these implementations enable LLMs to answer realistic and difficult questions.

## Question Guidelines

### Core Requirements

1. **Questions MUST be independent** - Not dependent on other questions
2. **Questions MUST require ONLY NON-DESTRUCTIVE operations**
3. **Questions must be REALISTIC, CLEAR, CONCISE, and COMPLEX**
4. **Questions must require deep exploration** - Multiple tool calls
5. **Questions must not be solvable with straightforward keyword search**

### Complexity and Depth

- Consider multi-hop questions requiring sequential tool calls
- May require paging through multiple pages of results
- Must require deep understanding, not surface-level knowledge
- Should stress-test tool return values with large responses

### Stability

- Questions must be designed so the answer DOES NOT CHANGE
- Do not ask about current state (reactions, members, etc.)
- Use historical/closed data

## Answer Guidelines

### Verification

Answers must be VERIFIABLE via direct string comparison:

- User ID, user name, display name
- Channel ID, channel name
- URL, title
- Numerical quantity
- Timestamp, datetime
- Boolean (True/False)
- Multiple choice answer

### Readability

Answers should prefer HUMAN-READABLE formats:

- Names, datetime, file name, URL, yes/no

### Stability

- Look at old/closed content
- Create questions based on concepts unlikely to change
- Be specific to avoid confusion with future data

## Good Question Examples

**Multi-hop question (GitHub MCP)**

```xml
<qa_pair>
   <question>Find the repository that was archived in Q3 2023 and had previously been the most forked project. What was the primary programming language?</question>
   <answer>Python</answer>
</qa_pair>
```

**Context-based question (Project Management MCP)**

```xml
<qa_pair>
   <question>Locate the initiative focused on improving customer onboarding completed in late 2023. What was the project lead's role title?</question>
   <answer>Product Manager</answer>
</qa_pair>
```

## Poor Question Examples

**Answer changes over time**

```xml
<qa_pair>
   <question>How many open issues are currently assigned?</question>
   <answer>47</answer>
</qa_pair>
```

**Too easy with keyword search**

```xml
<qa_pair>
   <question>Find the PR with title "Add authentication feature"</question>
   <answer>developer123</answer>
</qa_pair>
```

## Running Evaluations

### Setup

```bash
pip install anthropic mcp
export ANTHROPIC_API_KEY=your_api_key
```

### Local STDIO Server

```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  evaluation.xml
```

### HTTP Server

```bash
python scripts/evaluation.py \
  -t http \
  -u https://example.com/mcp \
  -H "Authorization: Bearer token123" \
  evaluation.xml
```

## Command-Line Options

```
-t, --transport    Transport type: stdio, sse, or http
-m, --model        Claude model to use
-c, --command      Command to run MCP server
-a, --args         Arguments for the command
-e, --env          Environment variables (KEY=VALUE)
-u, --url          MCP server URL (for sse/http)
-H, --header       HTTP headers
-o, --output       Output file for report
```

## Quality Checklist

- [ ] 10 independent questions
- [ ] All questions use read-only operations
- [ ] Questions require multiple tool calls
- [ ] Answers are single verifiable values
- [ ] Answers are stable over time
- [ ] Questions are realistic use cases
- [ ] Answers verified by solving yourself
