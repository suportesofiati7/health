# 13 Image Asset Alt Text Plan

## Purpose
Keep visual assets descriptive, ethical and concept-specific.

## Applies To
- `assets/`
- `concepts/*/assets/`
- Image tags in `concepts/*/*.html` and partials
- `concepts/*/asset-plan.md`
- `concepts/*/asset-notes.md`

## Specific Rules
- Use descriptive filenames.
- Images should support the story: botanical clinical luxury, consultation notes, skin texture macros, abstract laser light, professional portrait placeholders and refined still life.
- Avoid fake before-and-after images, fake procedure photos, unrealistic skin, generic hospital-blue stock style and repeated watermarks.
- Alt text should describe meaningful images.
- Decorative images should be marked decorative and not read as content.
- Asset style should vary by concept.

## Current Audit Notes
- `audit/reports/alt-text-validation.md`: PASS.
- Concept assets are present under each concept's `assets/` folder.
- Many decorative image alts contain concept names; future alt polish can improve naturalness without breaking audit coverage.

## Common Failure Patterns
- Reusing one asset kit across concepts.
- Writing generic alt text like `image`.
- Adding fake patient/result imagery for visual impact.
- Leaving important editorial images as decorative.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_static_site.py`.
- Inspect changed images manually for ethical compliance.
- Check image size/compression after replacing assets.
- Compare concepts to avoid repeated image rhythm.

## Completion Checklist
- [ ] Every meaningful image has useful alt text.
- [ ] Decorative images are correctly hidden.
- [ ] No fake patient or before/after imagery.
- [ ] Asset style supports the concept.
- [ ] Alt text audit passes.
