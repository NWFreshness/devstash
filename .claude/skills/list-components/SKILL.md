---
name: list-components
description: Use when the user asks to list, enumerate, or inventory the React components in the project (e.g. "list components", "what components do we have", "show components in [folder]"). Optionally scoped to a subdirectory.
argument-hint: "[subdirectory]"
---

## Task

List all React component files (.tsx, .ts, .jsx, .js) in the components folder.

If a [subdirectory] is provided via $ARGUMENTS, only list files in that subdirectory.

## Output Format

- Numbered list of files with relative paths
- Brief one-line description of each (infer from filename)
- Summary count at the end

If no files found, say "No components found."
