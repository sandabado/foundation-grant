import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const documentNames = [
  "annual-budget-breakdown.pdf",
  "bio-001-psychophysiology-protocol.pdf",
  "informed-consent-template.pdf",
  "investor-one-pager.pdf",
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
  assert.match(html, /Old Glory Peak[\s\S]*transect/i);
  assert.match(html, /Mycelial and ecological networks/i);
  assert.match(html, /IRB approval pending/i);
  assert.match(html, /Fiscal sponsorship inquiry active/i);
  assert.match(html, /Four elemental[\s\S]*domes/i);
  assert.match(html, /The Great Hall/i);
  assert.match(html, /Quincunx residential clusters/i);
  assert.match(html, /FIELD EQUIPMENT \/ V2\.0/i);
  assert.match(html, /45,000/);
  assert.match(html, /PROTOCOL \/ IN PREPARATION/);
  assert.match(html, /\/documents\/project-summary\.pdf/);
  assert.match(html, /DOWNLOAD WORKING DRAFT/);
  assert.doesNotMatch(html, /OSF RELEASE \/ IN PREPARATION/);
  assert.doesNotMatch(html, /Fiscal sponsorship active/i);
  assert.doesNotMatch(html, /IRB-approved\. Pre-registered/i);
  assert.doesNotMatch(html, /ACOUSTIC \+ FIELD RESEARCH/i);

  const orderedSections = [
    'id="site-context"',
    'id="method"',
    'id="phase-1-tet-garden"',
    'id="phase-2-elemental-domes"',
    'id="phase-3-great-hall"',
    'id="phase-4-quincunx"',
    'id="equipment"',
    'id="budget"',
    'id="timeline"',
    'id="people"',
    'id="library"',
  ];
  let previousIndex = -1;
  for (const section of orderedSections) {
    const sectionIndex = html.indexOf(section);
    assert.ok(sectionIndex > previousIndex, `${section} should follow the prior section`);
    previousIndex = sectionIndex;
  }
});

test("ships all seven linked research and investor PDF working drafts", async () => {
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
  assert.match(source, /Mycelial and Ecological Network Survey Protocol/);
  assert.match(source, /PROTOCOL \/ IN PREPARATION/);
});

test("integrates all four interactive architectural models inside their sections", async () => {
  const [experience, garden, dome, architecture] = await Promise.all([
    readFile(new URL("../app/FoundationExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TetrahedronGarden.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/FieldDome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ArchitecturalModels.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(experience, /function Garden\(\) \{\s*return <TetrahedronGarden \/>;/);
  assert.match(experience, /<FieldDome \/>/);
  assert.match(experience, /<GreatHallModel \/>/);
  assert.match(experience, /<ResidentialClustersModel \/>/);
  assert.doesNotMatch(experience, /Abstract plan/);
  assert.match(garden, /ENHANCE DETAIL/);
  assert.match(garden, /EXPAND MODEL/);
  assert.match(dome, /65 CONNECTED STRUTS/);
  assert.match(dome, /EXPAND MODEL/);
  assert.match(dome, /struts\.length !== 65/);
  assert.match(dome, /joints\.length !== 26/);
  assert.match(dome, /baseJoints !== 10/);
  assert.match(dome, /longStruts !== 35/);
  assert.match(dome, /shortStruts !== 30/);
  assert.doesNotMatch(dome, /segments\.push\(\[\s*new THREE\.Vector3\(Math\.cos/);
  assert.doesNotMatch(dome, /<torusGeometry args=\{\[3,/);
  assert.match(architecture, /function GreatHall/);
  assert.match(architecture, /dodecahedronGeometry args=\{\[0\.95, 0\]\}/);
  assert.match(architecture, /function ResidentialClusters/);
  assert.match(architecture, /Array\.from\(\{ length: 6 \}/);
  assert.match(architecture, /<OrbitControls/);
  assert.match(architecture, /requestFullscreen/);
});
