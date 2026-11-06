import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "package.json"));
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(process.argv[2] || process.cwd());
const app = path.join(root, "app/hair-growth-edit");
const cache = new Map();
function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    const localRequire = (id) => {
        if (!id.startsWith(".")) return require(id);
        const base = path.resolve(path.dirname(file), id);
        const found = [base, base + ".ts", base + ".tsx"].find(
            (p) => fs.existsSync(p) && fs.statSync(p).isFile(),
        );
        assert.ok(found, `Missing import: ${id}`);
        return load(found);
    };
    const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
        },
        reportDiagnostics: true,
    });
    assert.equal(compiled.diagnostics.length, 0);
    new Function("require", "module", "exports", compiled.outputText)(
        localRequire,
        module,
        module.exports,
    );
    cache.set(file, module.exports);
    return module.exports;
}
const { QUESTIONS } = load(path.join(app, "data/questions.ts"));
const { calculateResults } = load(path.join(app, "lib/scoring.ts"));
const { hasCompleteRoutineAnswers, firstMissingQuestionIndex } = load(
    path.join(app, "lib/assessmentCompleteness.ts"),
);
const { getFirstWashPlan } = load(path.join(app, "lib/firstWash.ts"));
const { groupProductShelf } = load(path.join(app, "lib/productShelf.ts"));
const questionIds = QUESTIONS.map((q) => q.id);
const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]));
Object.assign(answers, {
    chemical: 2,
    scalp: 0,
    scalpSymptoms: 0,
    lossPattern: 0,
    diameter: 1,
    pattern: 0,
});
assert.ok(
    QUESTIONS.find((q) => q.id === "blondeToning").options.every(
        (o) => Object.keys(o.scores).length === 0,
    ),
);
for (const [answer, expected] of [
    [0, "silverShampoo"],
    [1, "heartShampoo"],
    [2, null],
    [3, null],
    [undefined, null],
]) {
    const result = calculateResults({ ...answers, blondeToning: answer });
    const toners = result.paidRoutine.filter(
        (s) => s.product.category === "Optional toning shampoo",
    );
    assert.deepEqual(
        toners.map((s) => s.product.id),
        expected ? [expected] : [],
    );
    const shampoo = result.paidRoutine.find((s) =>
        s.product.category.toLowerCase().includes("cleanse"),
    );
    assert.ok(
        shampoo &&
            !["heartShampoo", "silverShampoo"].includes(shampoo.product.id),
    );
    const first = getFirstWashPlan(
        result.paidRoutine,
        "severalWeekly",
        false,
        "natural",
    );
    if (expected) {
        assert.ok(
            !first.steps.some((s) => s.title.includes(toners[0].product.name)),
        );
        assert.match(toners[0].timing, /at most every other wash/);
        assert.ok(
            groupProductShelf(result.paidRoutine)
                .find((g) => g.id === "optional")
                .steps.some((s) => s.product.id === expected),
        );
    }
}
const oldAnswers = { ...answers };
delete oldAnswers.blondeToning;
delete oldAnswers.repairTreatmentResponse;
assert.equal(hasCompleteRoutineAnswers(oldAnswers, questionIds, true), true);
assert.equal(firstMissingQuestionIndex(oldAnswers, questionIds, true), -1);
assert.equal(hasCompleteRoutineAnswers(oldAnswers, questionIds, false), false);
delete oldAnswers.scalp;
assert.equal(hasCompleteRoutineAnswers(oldAnswers, questionIds, true), false);
const { FounderVideoSpotlight } = load(
    path.join(app, "components/FounderVideoSpotlight.tsx"),
);
const { FounderStory } = load(path.join(app, "components/FounderStory.tsx"));
const video = renderToStaticMarkup(React.createElement(FounderVideoSpotlight));
assert.match(video, /autoPlay/);
assert.match(video, /muted/);
assert.match(video, /controls/);
assert.match(video, /Play soft music/);
assert.match(video, /\/growth-edit\/founder\/hair-in-motion.mp4/);
const story = renderToStaticMarkup(React.createElement(FounderStory));
assert.match(story, /cosmetology school/);
assert.match(story, /dense, fine hair/);
assert.ok(!story.includes("<video"));
const { startAmbientVideo } = load(path.join(app, "lib/videoPlayback.ts"));
const player = {
    muted: false,
    volume: 1,
    async play() {
        assert.equal(this.muted, true);
    },
};
assert.equal(await startAmbientVideo(player), "muted");
assert.equal(player.muted, true);
const results = fs.readFileSync(
    path.join(app, "components/Results.tsx"),
    "utf8",
);
assert.match(results, /\[product1\]\.map/);
assert.ok(!results.includes("[product1, product2].map"));
assert.ok(
    results.indexOf("<FounderVideoSpotlight") <
        results.indexOf("<RoutineSalesCard"),
);
assert.match(results, /<CheckoutSheet/);
assert.match(results, /onComplete=\{handleCheckoutComplete\}/);
console.log(
    "PASS: actual-answer toning selection, nourishing regular cleanse, optional shelf placement, legacy paid access, one starting recommendation, supplied founder media, muted autoplay and preserved checkout wiring.",
);
