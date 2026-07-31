# Microeconomics Web-Publishing Target

This directory is the public web target for the *Principles of Microeconomics* project. The textbook repository remains the source of truth; published files copied here are release artifacts.

## Stable URL Layout

- Book table of contents: `/micro/book/`
- Chapter HTML: `/micro/book/chapters/chNN-short-title/`
- Shared figures: `/micro/book/assets/figures/chNN/`
- Chapter Markdown: `/micro/book/downloads/markdown/chNN_short_title.md`
- Chapter PowerPoint: `/micro/book/downloads/slides/chNN_short_title.pptx`

Generated chapter pages should load `../../book.css` and `../../../style.css` from their chapter directories. The publication build should strip `aifiguredescription` blocks from HTML, PDF, and EPUB while retaining them in the downloadable Markdown.

The `micro/book/chapters/` and `micro/book/downloads/` directories, plus the marked chapter-navigation blocks in the Micro landing and book contents pages, are generated from `markny/micro-principles`. Do not edit them directly in this repository. Do not publish planning files, evidence ledgers, raw TikZ sources, or obsolete drafts here.
