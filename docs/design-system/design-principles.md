# Design principles

1. **Clarity before decoration.** The next heading, relationship and action must be obvious without visual effects.
2. **Consultation-led, not sales-led.** Calls to action are confident but never urgent, coercive or claim-heavy.
3. **One system, controlled variation.** Components share tokens and anatomy; page families select different compositions.
4. **Content determines composition.** Layout adapts to approved copy rather than deleting copy or forcing ten equal sections.
5. **Warmth through material choices.** Ivory, portraiture, serif hierarchy and generous rhythm create warmth; excessive gradients do not.
6. **Clinical trust through precision.** Alignment, readable copy, clear limitations, form feedback and consistent interaction express professionalism.
7. **Progressive enhancement.** Navigation/content/language links exist in HTML; JavaScript adds behaviour and feedback only.
8. **Bilingual parity.** PT is not a secondary theme or runtime reconstruction.

## Decision test

Before adding a visual device, ask:

```text
Does it clarify hierarchy, relationship, action or brand moment?
  ├─ yes → use the smallest effective treatment
  └─ no  → do not add it
```

## Acceptance criteria

- A component can be located and changed in one source file.
- Moving a section does not change its tone or layout.
- Disabling JavaScript preserves navigation, language switching and all content.
- Disabling motion preserves the same hierarchy.
- A new page can be assembled without copying page-specific CSS.
