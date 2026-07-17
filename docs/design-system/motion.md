# Motion system

Motion clarifies state, orientation and feedback. It never controls access to content and never supplies primary art direction.

## Tokens

| Token | Value | Use |
|---|---:|---|
| `--duration-instant` | `100ms` | pressed/active feedback |
| `--duration-fast` | `180ms` | hover, focus-adjacent state |
| `--duration-standard` | `280ms` | menu and accordion transitions |
| `--duration-slow` | `480ms` | explicit, restrained reveal |
| `--ease-standard` | `cubic-bezier(.2,.7,.2,1)` | general interface movement |
| `--ease-emphasized` | `cubic-bezier(.16,1,.3,1)` | menu/reveal arrival |

Only `opacity` and `transform` are used for decorative entrance motion. Height-dependent controls use native state where animation would risk clipping approved content.

## Approved motion

- Menu panel and scrim opening/closing.
- Focus-safe accordion state indication.
- Form busy, success and error feedback.
- Header’s compact scrolled state.
- Back-to-top visibility.
- Explicit opt-in reveal through `data-reveal="heading|media|group"`.

## Disallowed motion

- Scroll-jacking or delayed reading access.
- Pointer-following ambient graphics.
- Automatic animation of every section/card.
- Parallax that detaches decoration from content.
- Multiple modules independently calculating scroll progress.
- Hiding content until an observer succeeds.

## Shared scroll state

```text
one requestAnimationFrame read
├─ scroll position
├─ direction
├─ viewport/document height
└─ normalized progress
   ├─ header
   └─ optional floating tools
```

Subscribers consume the shared state and perform no independent layout reads in scroll handlers.

## Reduced motion and failure behaviour

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto;
  }

  [data-reveal] {
    opacity: 1;
    transform: none;
  }
}
```

The implementation narrows transition duration selectively rather than globally forcing zero-duration timers that can break event-driven components. Without JavaScript, all content is visible and controls retain native behaviour where available.

## Acceptance criteria

- No full-document mutation observer reinitializes the site.
- One shared module owns scroll reads.
- Reveal is explicit and defaults to visible.
- Keyboard focus is never animated off-screen or obscured.
- Reduced-motion QA covers menu, forms, header and all opt-in reveals.
