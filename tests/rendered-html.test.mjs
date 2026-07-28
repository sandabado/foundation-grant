import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const documentNames = [
  "annual-budget-breakdown.pdf",
  "bio-001-psychophysiology-protocol.pdf",
  "informed-consent-template.pdf",
  "magnetometer-survey-protocol.pdf",
  "phase-1-action-plan.pdf",
  "project-summary.pdf",
];

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Old Glory Peak field station experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Whole Body Foundation — Old Glory Peak Field Station/i);
  assert.match(html, /Make the invisible/);
  assert.match(html, /Moss patch monitoring stations installed/);
  assert.match(html, /Camera trap network operational/);
  assert.match(html, /\/documents\/project-summary\.pdf/);
  assert.match(html, /DOWNLOAD WORKING DRAFT/);
  assert.doesNotMatch(html, /OSF RELEASE \/ IN PREPARATION/);
});

test("ships all six linked research PDF working drafts", async () => {
  const documentsRoot = new URL("../public/documents/", import.meta.url);
  const files = (await readdir(documentsRoot))
    .filter((name) => name.endsWith(".pdf"))
    .sort();
  assert.deepEqual(files, documentNames);

  const source = await readFile(
    new URL("../app/FoundationExperience.tsx", import.meta.url),
    "utf8",
  );

  for (const name of documentNames) {
    const pdf = await readFile(new URL(name, documentsRoot));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.match(source, new RegExp(`/documents/${name.replaceAll(".", "\\.")}`));
  }

  assert.match(source, /DATASET \/ PENDING FIELD COLLECTION/);
});
