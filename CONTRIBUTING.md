# Development workflow

## Branches: trunk-based

- `main` is the only long-lived branch. It is protected: nobody pushes to it,
  every change arrives through a merge request with a green pipeline.
- Work happens on short-lived branches created from `main`, merged within a day or two:
  `feat/<short-description>`, `fix/<short-description>`, `chore/…`, `docs/…`.
- Every merge to `main` is released and deployed to staging; production is a
  manual promotion of a version already running in staging.

**Why not GitFlow?** `develop`, release and hotfix branches exist to maintain
several versions in parallel. We ship one version continuously, so a single
main branch plus short branches is enough, and keeps merges small.

## Merging

Merge requests are **squash-merged**. The squash commit message becomes the
only commit on `main`, and it is what semantic-release reads to compute the
next version. Before merging, check that the squash message follows the
convention below (not GitLab's default "Merge branch …" title).

## Commit messages: Conventional Commits

```
<type>(<optional scope>): <description>
```

| Type | Effect on the version |
|---|---|
| `fix:` | patch: 1.2.3 → 1.2.4 |
| `feat:` | minor: 1.2.3 → 1.3.0 |
| `feat!:` or a `BREAKING CHANGE:` footer | major: 1.2.3 → 2.0.0 |
| `docs:`, `chore:`, `ci:`, `test:`, `refactor:`, `style:`, `build:`, `perf:` | no release |

Examples: `feat(api): add note deletion`, `fix: reject empty notes`.
The convention is checked by commitlint in CI (`commitlint.config.js`).
