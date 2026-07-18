# Asset naming and folders

The site uses lowercase, hyphenated public asset paths. Folder names describe the technical ownership in English; filenames describe the visual subject in concise Brazilian Portuguese. This makes paths understandable for engineers while keeping a natural local-language description for content imagery.

| Asset type | Folder | Filename rule |
| --- | --- | --- |
| Shared UI icons | `assets/shared/interface-icons/` | `icone-…` plus the Portuguese visual/function description. |
| Treatment imagery | `assets/treatments/services/` | The actual treatment or consultation shown; use location only when it is genuinely relevant. |
| Journal imagery | `assets/journal/articles/` | The article subject or portrait shown. |
| Page-owned imagery | `assets/pages/<page>/<section>/` | English page/section folder; Portuguese visual-subject filename. |
| Shared identity, backgrounds, social and favicons | `assets/shared/…/` | Portuguese description of the actual asset, not a repeated service list. |

Use one URL for the same image wherever it appears. Do not duplicate a shared image into page folders only to add keywords; that weakens caching and produces misleading asset ownership.

When adding an image, use a short, descriptive name such as `depilacao-a-laser-londrina.webp`, only if the image genuinely depicts that service in Londrina. Avoid generic names (`image-1.png`) and keyword strings that do not describe the image. Update every HTML, CSS, JavaScript, JSON and structured-data reference, then run:

```bash
npm run check:assets
npm run check:seo
npm run build
```
