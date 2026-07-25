# Microeconomics Web-Publishing Target

This directory is the public web target for the *Principles of Microeconomics* project. The textbook repository remains the source of truth; published files copied here are release artifacts.

## Stable URL Layout

- Book table of contents: `/micro/book/`
- Chapter HTML: `/micro/book/chapters/chNN-short-title/`
- Shared figures: `/micro/book/assets/figures/chNN/`
- Chapter Markdown: `/micro/book/downloads/chNN-short-title.md`
- Chapter PDF: `/micro/book/downloads/chNN-short-title.pdf`
- Full-book files: `/micro/book/downloads/principles-of-microeconomics.{pdf,epub}`

Generated chapter pages should load `../../book.css` and `../../../style.css` from their chapter directories. The publication build should strip `aifiguredescription` blocks from HTML, PDF, and EPUB while retaining them in the downloadable Markdown.

Do not publish planning files, evidence ledgers, raw TikZ sources, or obsolete drafts here. Add a chapter link to `index.html` only after the corresponding HTML has been copied and checked.
