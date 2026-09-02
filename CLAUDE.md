## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Obsidian vault (gob)
- `graphify-out/` in this repo is a symlink to `/mnt/e/Obsidian/claude/graphify-out/CointMU-CLI`.
- All graphify output lives in the vault automatically. Run `gob refresh` (from anywhere) to update every project + rebuild the combined index at /mnt/e/Obsidian/claude/graphify-out/INDEX.html.

