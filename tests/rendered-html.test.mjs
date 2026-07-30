import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const publicDocumentNames = [
  "bio-001-psychophysiology-protocol.pdf",
  "informed-consent-template.pdf",
];

const protectedDocumentNames = [
  "annual-budget-breakdown.pdf",
  "investor-one-pager.pdf",
  "magnetometer-survey-protocol.pdf",
  "phase-1-action-plan.pdf",
  "project-summary.pdf",
];

const forbiddenPublicTerms = [
  /Living River/i,
  /Tier 1/i,
  /Tier 2/i,
  /Tier 3/i,
  /Tensor Ring/i,
  /torsion field/i,
  /structured water/i,
  /vortex water/i,
  /sacred geometry/i,
  /Tetrahedron Garden/i,
  /elemental domes/i,
  /The Great Hall/i,
  /Clover Homes/i,
];

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(
    "test",
    `${pathname}-${process.pid}-${Date.now()}-${Math.random()}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
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

test("renders a concise, mission-first public homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Whole Body Foundation — Old Glory Peak Field Station/i);
  assert.match(html, /FIELDWORK FOR A[\s\S]*Living Planet/);
  assert.match(html, /Observe the land\. Test what works\. Share what holds\./);
  assert.match(html, /The desert is not empty\.[\s\S]*It is information-dense\./);
  assert.match(html, /Start with the ground\.[\s\S]*Build from truth\./);
  assert.match(html, /Public mission\.[\s\S]*Private working room\./);
  assert.match(html, /For the people making it real\./);
  assert.match(html, /No shared password or private plan is[\s\S]*shipped by this public page/);
  assert.match(html, /https:\/\/www\.odin\.management\/login/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /href="\/research"/);
  assert.match(html, /href="\/about"/);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /Partner Portal/);

  for (const forbidden of forbiddenPublicTerms) {
    assert.doesNotMatch(html, forbidden);
  }

  assert.doesNotMatch(html, /45,000/);
  assert.doesNotMatch(html, /75,000/);
  assert.doesNotMatch(html, /\/documents\/investor-one-pager\.pdf/);
  assert.doesNotMatch(html, /\/documents\/annual-budget-breakdown\.pdf/);
  assert.doesNotMatch(html, /\/documents\/phase-1-action-plan\.pdf/);
});

test("serves the four-page public architecture with one shared navigation", async () => {
  const routeAssertions = [
    ["/research", /Mechanism[\s\S]*before claim/i],
    ["/about", /Led from[\s\S]*the field/i],
    ["/contact", /Begin with[\s\S]*a real question/i],
  ];

  for (const [pathname, expected] of routeAssertions) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, expected);
    assert.match(html, /WHOLE BODY FOUNDATION/);
    assert.match(html, /href="\/research"/);
    assert.match(html, /href="\/about"/);
    assert.match(html, /href="\/contact"/);
    assert.match(html, /https:\/\/www\.odin\.management\/login/);

    for (const forbidden of forbiddenPublicTerms) {
      assert.doesNotMatch(html, forbidden, `${pathname} contains ${forbidden}`);
    }
  }
});

test("keeps all proprietary 3D components out of public route imports", async () => {
  const publicSources = await Promise.all(
    [
      "../app/FoundationExperience.tsx",
      "../app/PublicFieldMap.tsx",
      "../app/research/page.tsx",
      "../app/about/page.tsx",
      "../app/contact/page.tsx",
      "../app/SiteNav.tsx",
      "../app/SiteFooter.tsx",
      "../app/layout.tsx",
      "../app/robots.ts",
      "../app/sitemap.ts",
    ].map((path) => readFile(new URL(path, import.meta.url), "utf8")),
  );
  const publicSource = publicSources.join("\n");

  assert.doesNotMatch(publicSource, /from "next\/dynamic"/);
  assert.doesNotMatch(publicSource, /TetrahedronGarden/);
  assert.doesNotMatch(publicSource, /FieldDome/);
  assert.doesNotMatch(publicSource, /GreatHallModel/);
  assert.doesNotMatch(publicSource, /ResidentialClustersModel/);
  assert.doesNotMatch(publicSource, /ThreeModelViewer/);
  assert.match(publicSource, /https:\/\/www\.odin\.management\/login/);

  for (const forbidden of forbiddenPublicTerms) {
    assert.doesNotMatch(publicSource, forbidden);
  }

  for (const privateSource of [
    "../app/TetrahedronGarden.tsx",
    "../app/FieldDome.tsx",
    "../app/ArchitecturalModels.tsx",
    "../app/SurveyMap.tsx",
  ]) {
    await assert.rejects(
      readFile(new URL(privateSource, import.meta.url)),
      (error) => error?.code === "ENOENT",
      `${privateSource} must not ship in the public repository`,
    );
  }
});

test("keeps the hero concise while the terrain moves through a solar cycle", async () => {
  const [experience, terrain] = await Promise.all([
    readFile(new URL("../app/FoundationExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/InteractiveTerrain.tsx", import.meta.url), "utf8"),
  ]);

  const hero = experience.slice(
    experience.indexOf('<header className="hero"'),
    experience.indexOf('<section id="mission"'),
  );
  assert.equal(hero.match(/<p>/g)?.length, 1);
  assert.doesNotMatch(hero, /hero-stats/);
  assert.match(
    hero,
    /className="hero-kicker">FIELDWORK FOR A<\/span>[\s\S]*<em>Living Planet<\/em>/,
  );

  assert.match(terrain, /float solarPhase = fract\(time \* 0\.0225 \+ 0\.75\)/);
  assert.match(terrain, /vec3 nightTerrain/);
  assert.match(terrain, /float dayProgress/);
  assert.match(terrain, /float directionalLight/);
  assert.match(terrain, /float movingShadow/);
  assert.match(terrain, /float sunRays/);
  assert.match(terrain, /float lensGhost/);
  assert.match(terrain, /vec3 cottonSky/);
  assert.match(terrain, /float fieldSignal/);
  assert.match(terrain, /const starFragmentShader/);
  assert.match(terrain, /FIELD SIGNAL \/ SOLAR CYCLE/);
  assert.match(terrain, /OBSERVATION \/ NOT NAVIGATION/);
  assert.doesNotMatch(terrain, /16 GPS STATIONS/);
});

test("shows only public USGS field context and excludes the detailed working map", async () => {
  const [research, publicMap, mapAsset] = await Promise.all([
    readFile(new URL("../app/research/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PublicFieldMap.tsx", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../public/maps/morongo-valley-usgs-imagery-topo.jpg",
        import.meta.url,
      ),
    ),
  ]);

  assert.match(research, /import PublicFieldMap from "\.\.\/PublicFieldMap"/);
  assert.match(research, /<PublicFieldMap \/>/);
  assert.match(
    research,
    /Final station locations remain subject[\s\S]*to field reconnaissance/,
  );
  assert.match(publicMap, /morongo-valley-usgs-imagery-topo\.jpg/);
  assert.match(publicMap, /USGS The National Map/);
  assert.match(publicMap, /NO PROJECT SITING OVERLAYS/);
  assert.match(publicMap, /station, transect, and construction-planning[\s\S]*intentionally omitted/);
  assert.doesNotMatch(publicMap, /ridgeStations/);
  assert.doesNotMatch(publicMap, /survey-proposed/);
  assert.doesNotMatch(publicMap, /survey-fixed/);
  assert.doesNotMatch(publicMap, /MINE GRID/);
  await assert.rejects(
    readFile(new URL("../app/SurveyMap.tsx", import.meta.url)),
    (error) => error?.code === "ENOENT",
    "The detailed working map must remain behind the ØDIN gate",
  );
  assert.equal(mapAsset[0], 0xff);
  assert.equal(mapAsset[1], 0xd8);
  assert.ok(mapAsset.byteLength < 1_000_000);
});

test("labels research maturity without turning methods into results", async () => {
  const research = await readFile(
    new URL("../app/research/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(research, /ESTABLISHED MEASUREMENT/);
  assert.match(research, /ACTIVE PROTOCOL \/ PRE-DATA/);
  assert.match(research, /PENDING ETHICS REVIEW/);
  assert.match(research, /ACTIVE HYPOTHESIS/);
  assert.match(research, /A status describes the maturity of the work—not a positive result/);
  assert.match(research, /Design inspiration is kept separate from research claims/);
});

test("publishes clean metadata, crawl rules, sitemap, and social preview", async () => {
  const [layout, robots, sitemap, social] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(layout, /metadataBase: new URL\("https:\/\/wholebody\.foundation"\)/);
  assert.match(layout, /url: "\/og\.png"/);
  assert.match(layout, /Observe the land\. Test what works\. Share what holds\./);
  assert.match(robots, /"\/presentation"/);
  assert.match(robots, /"\/investors"/);
  assert.match(robots, /"\/docs"/);
  assert.match(robots, /https:\/\/wholebody\.foundation\/sitemap\.xml/);
  assert.match(sitemap, /\["", "\/research", "\/about", "\/contact"\]/);
  assert.equal(social.subarray(1, 4).toString(), "PNG");

  for (const source of [layout, robots, sitemap]) {
    for (const forbidden of forbiddenPublicTerms) {
      assert.doesNotMatch(source, forbidden);
    }
  }
});

test("ships only public research documents in the public library", async () => {
  const documentsRoot = new URL("../public/documents/", import.meta.url);
  const files = (await readdir(documentsRoot))
    .filter((name) => name.endsWith(".pdf"))
    .sort();
  assert.deepEqual(files, [...publicDocumentNames].sort());

  const research = await readFile(
    new URL("../app/research/page.tsx", import.meta.url),
    "utf8",
  );

  for (const name of publicDocumentNames) {
    const pdf = await readFile(new URL(name, documentsRoot));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.match(research, new RegExp(`/documents/${name.replaceAll(".", "\\.")}`));
  }

  for (const name of protectedDocumentNames) {
    assert.doesNotMatch(
      research,
      new RegExp(`/documents/${name.replaceAll(".", "\\.")}`),
    );
    await assert.rejects(
      readFile(new URL(name, documentsRoot)),
      (error) => error?.code === "ENOENT",
      `${name} must not ship in the public repository`,
    );
  }
});

test("states grounded public commitments and preserves the founder portrait", async () => {
  const [about, portrait] = await Promise.all([
    readFile(new URL("../app/about/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/images/jesse-gawlik.jpg", import.meta.url)),
  ]);

  assert.match(about, /Register field protocols before data collection begins/);
  assert.match(about, /De-identify participant data/);
  assert.match(about, /Share failed hypotheses and null findings/);
  assert.match(about, /licensed engineering before fabrication/);
  assert.match(about, /src="\/images\/jesse-gawlik\.jpg"/);
  assert.match(about, /width=\{1600\}/);
  assert.match(about, /height=\{1200\}/);
  assert.doesNotMatch(about, /from "next\/image"/);
  assert.equal(portrait[0], 0xff);
  assert.equal(portrait[1], 0xd8);
  assert.ok(portrait.byteLength < 500_000);
});
