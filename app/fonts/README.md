# Bundled application fonts

Fraunces, Manrope, and Anek Malayalam are bundled to avoid build-time requests
to Google Fonts. `app/layout.jsx` loads them with `next/font/local`, keeping the
existing CSS variables, font families, optical sizing, and displayed weights.

Sources: Google's official font repository, retrieved 2026-10-30:

- [Fraunces](https://github.com/google/fonts/tree/main/ofl/fraunces)
- [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope)
- [Anek Malayalam](https://github.com/google/fonts/tree/main/ofl/anekmalayalam)

The original variable TTF files were compressed to WOFF2 with FontTools 4.61.1.
Unused axes were pinned to the defaults used by the previous Google Fonts
requests: Fraunces `SOFT=0`, `WONK=1`, and Anek Malayalam `wdth=100`.
All Unicode glyphs and the required variable weight/optical-size axes remain.
The fonts are distributed under their accompanying SIL Open Font Licenses.
