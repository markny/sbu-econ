# Supply and Demand Shift Practice

One shared practice app serves both courses. Keep ordinary markets; sports-specific examples belong in the Sports Economics chapter rather than being forced into every exercise.

- Default/Micro entry: `/supply-demand-shift-practice/`
- Sports entry: `/supply-demand-shift-practice/?course=sports-econ`

Only the Sports URL changes the introduction and return link. Unknown course values use the Micro default. There is no saved course preference and no arbitrary return-URL parameter.

## Source and checks

`index.html` loads `js/main.js` as an ES module. The active app imports its question generators from `js/scenarios.js` and its course navigation from `js/course-context.js`. The older `js/app.js` is not the page entrypoint. Do not recreate a second scenario catalog in `main.js`.

Question generation chooses a market compatible with the event (or both events). Crop shocks use crops, inventory-timing examples use storable goods, and the inferior-good example explicitly assumes rice is inferior for the buyers in that question. The same restrictions apply to “Try another like this.”

Serve over HTTP, including for local previews; do not open `index.html` as a `file:` URL. No build step or dependency installation is required.

Run the checks from the site repository with Node 22.13 or newer:

```sh
node --test supply-demand-shift-practice/tests/practice.test.mjs
```

The checks cover both course entry points, the actual app initialization and controls using a document double, all 28 event directions and 192 demand/supply pairs, similar-question generation, and asset references. They do not claim browser visual QA.

The app is maintained in `sbu-econ`, outside the generated `sports-econ/` directory. Its Chapter 2 link and slide note are maintained in the canonical `sports-econ-v2` repository. When publishing coordinated changes, push this site's app changes first, then push the book changes that generate the chapter and downloads. Do not edit generated chapter HTML directly.
