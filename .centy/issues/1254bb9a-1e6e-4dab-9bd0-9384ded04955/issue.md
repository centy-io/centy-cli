# Improve test coverage to 80% threshold

## Background

Coverage thresholds were temporarily lowered from 80% to allow CI/CD to pass:
- lines: 40%
- functions: 45%
- branches: 25%
- statements: 40%

## Goal

Incrementally raise test coverage back to 80% across all metrics.

## Plan

### Phase 1: Quick wins (target: 50%)
- Add tests for utility functions in src/utils/
- Add tests for simple daemon wrapper functions

### Phase 2: Core functionality (target: 65%)
- Add tests for command handlers
- Add tests for cross-project search utilities

### Phase 3: Full coverage (target: 80%)
- Add integration tests
- Cover edge cases and error paths
- Update vitest.config.ts thresholds back to 80%

## Files to focus on

Check coverage report with `pnpm test:coverage` to identify lowest coverage areas.

## Acceptance Criteria

- [ ] All coverage metrics at 80% or higher
- [ ] vitest.config.ts thresholds restored to 80%
- [ ] CI/CD passes with full coverage requirements
