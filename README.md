# sbu-econ

Economics teaching site with course pages and interactive tools.

## Managerial Economics

The public reading edition is served from `managerial-econ/` at
<https://sbu-econ.org/managerial-econ/>. Its canonical Markdown and build tools
live in the separate `Textbooks/managerial-econ` project. Do not edit generated
chapter HTML here as manuscript source.

To update this book, run `python3 -B scripts/build-html.py` and
`python3 -B scripts/check-html.py` in the textbook repository, then copy only
`output/html/site/` into this repository's `managerial-econ/` directory.
The public build contains the readings, reader aids, fictional case, figures,
and self-contained chapter downloads. Never copy the entire textbook or course
workspace: planning files, evidence records, and instructor materials are not
part of the public site.

This repository is shared across textbook workflows. Check for local changes
and fetch the current remote before publishing; preserve other sections and
homepage changes. A push to `main` triggers the existing Cloudflare Pages
deployment. Verify both its deployment check and the live custom-domain pages.
