# Fonts

Place the self-hosted webfont files here. The stylesheet
`app/assets/css/fonts.css` expects these exact filenames:

- `Vazirmatn-Regular.woff2`  (weight 400)
- `Vazirmatn-Medium.woff2`   (weight 500)
- `Vazirmatn-Bold.woff2`     (weight 700)
- `Vazirmatn-ExtraBold.woff2` (weight 800)

Download them from the official release:
<https://github.com/rastikerdar/vazirmatn/releases> — take the `woff2` files
from the `fonts/webfonts/` directory of the release archive.

They are intentionally not committed to the repository. Until they are added,
the site falls back to Tahoma / the system sans-serif, which renders Persian
correctly but with slightly different metrics.
