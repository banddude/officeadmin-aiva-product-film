# V5 fonts (not committed)

Font binaries are not stored in this repository. Fetch them into this folder before rendering:

- `BricolageGrotesque.ttf`: https://github.com/google/fonts/raw/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz,wdth,wght%5D.ttf (SIL Open Font License, see `OFL-Bricolage.txt`)
- `Inter.woff2`: the same Inter build `npm run fonts` places in `public/fonts/` (https://github.com/rsms/inter, SIL Open Font License). Copy it here.

The film loads Inter under the family name `FilmInter`, which the real-UI DOM snapshots reference.
