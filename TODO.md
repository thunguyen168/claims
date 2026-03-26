# Implementation Progress

## Phase 1: Foundation
- [x] Extract configuration into separate JSON files
- [ ] Create module structure (src/engine, src/ui, etc.)
- [ ] Extract simulation engine as pure functions
- [ ] Extract Monte Carlo engine as pure functions
- [ ] Extract chart rendering
- [ ] Extract UI code
- [ ] Add IndexedDB scenario storage
- [ ] Add JSON config import/export
- [ ] Create Excel config template
- [ ] Verify everything still works in browser

## Phase 2: Modelling
- [ ] Implement claim severity distribution (lognormal + Pareto tail)
- [ ] Calibrate MC parameters per incident type
- [ ] Add jurisdiction-specific legal parameters
- [ ] Add inflation adjustment to deterministic mode
- [ ] Improve historical validation

## Phase 3: Client Polish
- [ ] Add audit trail for parameter changes
- [ ] Build side-by-side scenario comparison
- [ ] Add tiered admin access (basic/intermediate/advanced)
- [ ] Add report branding options
- [ ] User acceptance testing
