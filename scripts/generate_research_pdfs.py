from __future__ import annotations

import os
import shutil
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    FrameBreak,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "documents"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

PAPER = colors.HexColor("#F6F4ED")
INK = colors.HexColor("#111411")
MUTED = colors.HexColor("#5E655D")
GREEN = colors.HexColor("#84A66E")
MINERAL = colors.HexColor("#2D4F3A")
RUST = colors.HexColor("#B87333")
LINE = colors.HexColor("#D9DED4")

PAGE_WIDTH, PAGE_HEIGHT = letter
TODAY = "July 28, 2026"
VERSION = "Working Draft 0.1"


base_styles = getSampleStyleSheet()
styles = {
    "title": ParagraphStyle(
        "Title",
        parent=base_styles["Title"],
        fontName="Times-Bold",
        fontSize=25,
        leading=27,
        textColor=INK,
        spaceAfter=7,
        alignment=TA_LEFT,
    ),
    "subtitle": ParagraphStyle(
        "Subtitle",
        parent=base_styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=MINERAL,
        tracking=0.5,
        spaceAfter=18,
    ),
    "h1": ParagraphStyle(
        "H1",
        parent=base_styles["Heading1"],
        fontName="Times-Bold",
        fontSize=17,
        leading=20,
        textColor=MINERAL,
        spaceBefore=13,
        spaceAfter=7,
        keepWithNext=True,
    ),
    "h2": ParagraphStyle(
        "H2",
        parent=base_styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=9.2,
        leading=12,
        textColor=MINERAL,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True,
    ),
    "body": ParagraphStyle(
        "Body",
        parent=base_styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.8,
        leading=12.2,
        textColor=INK,
        spaceAfter=6,
    ),
    "small": ParagraphStyle(
        "Small",
        parent=base_styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        textColor=MUTED,
        spaceAfter=4,
    ),
    "bullet": ParagraphStyle(
        "Bullet",
        parent=base_styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.6,
        leftIndent=12,
        firstLineIndent=-8,
        textColor=INK,
        spaceAfter=3,
    ),
    "label": ParagraphStyle(
        "Label",
        parent=base_styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=6.8,
        leading=9,
        textColor=GREEN,
        tracking=0.9,
        spaceAfter=4,
    ),
    "table_head": ParagraphStyle(
        "TableHead",
        parent=base_styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.2,
        leading=9,
        textColor=colors.white,
    ),
    "table": ParagraphStyle(
        "Table",
        parent=base_styles["Normal"],
        fontName="Helvetica",
        fontSize=7,
        leading=9,
        textColor=INK,
    ),
}


def p(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, styles[style])


def bullets(items: list[str]) -> list[Paragraph]:
    return [p(f"- {item}", "bullet") for item in items]


def title_block(title: str, subtitle: str) -> list:
    return [
        p("WHOLE BODY FOUNDATION / OLD GLORY PEAK FIELD STATION", "label"),
        p(title, "title"),
        p(f"{subtitle}<br/>{VERSION} / {TODAY}", "subtitle"),
    ]


def notice(text: str, tone: str = "draft") -> Table:
    color = RUST if tone == "draft" else GREEN
    table = Table([[p(text, "small")]], colWidths=[6.8 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.Color(color.red, color.green, color.blue, alpha=0.09)),
                ("BOX", (0, 0), (-1, -1), 0.8, color),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def data_table(
    rows: list[list[str]],
    widths: list[float],
    repeat_rows: int = 1,
    right_align_last: bool = False,
) -> Table:
    rendered = []
    for row_index, row in enumerate(rows):
        style = "table_head" if row_index == 0 else "table"
        rendered.append([p(cell, style) for cell in row])
    table = Table(rendered, colWidths=widths, repeatRows=repeat_rows, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), MINERAL),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    if right_align_last:
        commands.append(("ALIGN", (-1, 1), (-1, -1), "RIGHT"))
    table.setStyle(TableStyle(commands))
    return table


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    canvas.setFillColor(MINERAL)
    canvas.rect(0, PAGE_HEIGHT - 0.18 * inch, PAGE_WIDTH, 0.18 * inch, fill=1, stroke=0)
    canvas.setStrokeColor(GREEN)
    canvas.setLineWidth(0.7)
    canvas.line(0.6 * inch, 0.48 * inch, PAGE_WIDTH - 0.6 * inch, 0.48 * inch)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 6.5)
    canvas.drawString(0.6 * inch, 0.29 * inch, "WHOLE BODY FOUNDATION / OLD GLORY PEAK FIELD STATION")
    canvas.drawRightString(PAGE_WIDTH - 0.6 * inch, 0.29 * inch, f"PAGE {doc.page}")
    canvas.setFillColor(colors.Color(0.18, 0.31, 0.23, alpha=0.035))
    canvas.setFont("Helvetica-Bold", 42)
    canvas.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2)
    canvas.rotate(32)
    canvas.drawCentredString(0, 0, "WORKING DRAFT")
    canvas.restoreState()


def build_pdf(filename: str, title: str, subject: str, story: list) -> Path:
    path = OUTPUT_DIR / filename
    doc = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        rightMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        topMargin=0.52 * inch,
        bottomMargin=0.62 * inch,
        title=title,
        author="Whole Body Foundation",
        subject=subject,
    )
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    shutil.copy2(path, PUBLIC_DIR / filename)
    return path


def project_summary() -> Path:
    story = title_block(
        "Project Summary",
        "Public-interest field science at the Old Glory Peak transect corridor",
    )
    story += [
        p(
            "Whole Body Foundation is developing a field research station in Morongo Valley, California. "
            "The project combines repeatable geomagnetic mapping, mineral identification, water-quality "
            "testing, dryland agriculture, natural-material structures, and open public documentation."
        ),
        p("PURPOSE", "h2"),
        p(
            "The first objective is a durable baseline across the Old Glory Peak corridor. Four field "
            "transects cross mapped fault structures and the ridge itself. Each station links magnetic "
            "field strength to GPS location, lithology, mineral assemblage, and photographic evidence."
        ),
        p("PLACE", "h2"),
        p(
            "The study corridor spans the Pinto Mountain Fault, Morongo Valley Fault, and the regional "
            "context of the Emerson Fault and 1992 Landers rupture zone. Historical mining in the Morongo "
            "District provides a documented context for mineralized quartz vein systems."
        ),
        p("METHOD", "h2"),
    ]
    story += bullets(
        [
            "Environmental geophysics: smartphone magnetometer transects calibrated against USGS aeromagnetic data; standard field mineral tests; ORP, pH, heavy-metal, and mineral-content water testing.",
            "Community psychophysiology: a future IRB-reviewed matched-community study using 5-minute RMSSD recordings and monthly salivary cortisol sampling.",
            "Network and systems science: decision-latency, local economic-velocity, and community-network scaling analysis.",
        ]
    )
    story += [
        p("FIELD SYSTEM", "h2"),
        p(
            "A 10-foot, metal-free 2V geodesic dome will serve as the field station. A 1,000-gallon "
            "gravity-fed cistern supports three productive growing spirals. An air-gapped Raspberry Pi 5 "
            "field computer stores GPS-stamped notes locally without a cloud dependency."
        ),
        p("FIRST-YEAR PLAN AND BUDGET", "h2"),
        p(
            "The first phase targets 50 GPS-tagged points, completion of Transects A-D, an open field log, "
            "and a published mineral catalog by December 2026. A $75,000 first-year plan prioritizes field "
            "collection, data stewardship, construction, insurance, and public documentation."
        ),
        p("OPEN SCIENCE COMMITMENT", "h2"),
        p(
            "Hypotheses will be pre-registered before collection. De-identified datasets, negative results, "
            "replication materials, and annual financial summaries will be published under a CC-BY license "
            "where ethically and legally permitted."
        ),
        Spacer(1, 5),
        notice(
            "STATUS: Planning document. Site access, scientific review, fiscal sponsorship, and human-subjects "
            "approval must be confirmed before the corresponding activities begin."
        ),
    ]
    return build_pdf(
        "project-summary.pdf",
        "Whole Body Foundation Project Summary",
        "One-page working summary of the Old Glory Peak field research program.",
        story,
    )


def magnetometer_protocol() -> Path:
    story = title_block(
        "Magnetometer Survey Protocol",
        "Transects A-D / GPS-tagged field-strength baseline",
    )
    story += [
        notice(
            "FIELD DRAFT: Final endpoints, land access, exclusion zones, and safety controls require field "
            "verification before collection. Transect C dimensions reflect the current survey specification."
        ),
        p("1. PURPOSE", "h1"),
        p(
            "Create a repeatable, auditable baseline of total magnetic field readings across the Old Glory "
            "Peak corridor. The protocol links every reading to position, orientation, device state, geology, "
            "a sample identifier when collected, and a photographic record."
        ),
        p("2. SURVEY DESIGN", "h1"),
        data_table(
            [
                ["Line", "Target", "Current specification", "Primary purpose"],
                ["A", "Pinto Fault Crossing", "Route perpendicular to mapped trace; final endpoints and spacing pending access reconnaissance.", "Characterize field change across the fault corridor."],
                ["B", "Morongo Valley Fault Crossing", "Route perpendicular to mapped trace; final endpoints and spacing pending access reconnaissance.", "Compare magnetic and water-context observations."],
                ["C", "Old Glory Peak Ridge Crest", "East-west; 400 m; 9 stations at 50 m spacing.", "High-resolution mineralized-zone baseline near historical workings."],
                ["D", "Mine Area Grid", "Grid near historical adits; boundaries pending access and safety review.", "Map local anomalies without entering workings."],
            ],
            [0.42 * inch, 1.33 * inch, 2.68 * inch, 2.37 * inch],
        ),
        p("3. REQUIRED EQUIPMENT", "h1"),
    ]
    story += bullets(
        [
            "Primary smartphone with three-axis magnetometer and raw-data export capability.",
            "Independent GNSS or GPS receiver when available; paper map and compass as backup.",
            "Non-magnetic measuring tape, station stakes or removable markers, field notebook, and time source.",
            "Camera; sample bags and labels; streak plate; Mohs kit; dilute HCl kit with eye and skin protection.",
            "Water test equipment when a lawful sample point is included: calibrated pH and ORP meters plus approved sample containers.",
            "First-aid kit, satellite messenger or radio, sun protection, water, and site-specific personal protective equipment.",
        ]
    )
    story += [
        p("4. DEVICE CONTROL AND CALIBRATION", "h1"),
    ]
    story += bullets(
        [
            "Record device model, operating-system version, application version, sensor range, and export format.",
            "Remove magnetic cases, watches, tools, vehicles, speakers, batteries, and other ferrous objects from the measurement area.",
            "At the daily control station, collect a 60-second stationary record before and after the transect.",
            "Run the device calibration motion only before the control record, never between ordinary stations unless the application reports loss of calibration.",
            "Maintain one device orientation throughout the survey; record any unavoidable orientation change as a protocol deviation.",
            "Synchronize timestamps to UTC and compare the control station with available USGS or geomagnetic reference data during quality review.",
        ]
    )
    story += [
        p("5. STATION SEQUENCE", "h1"),
        data_table(
            [
                ["Step", "Field action", "Record"],
                ["1", "Approach from the same direction and stop at the planned coordinate.", "Station ID, UTC time, GPS accuracy."],
                ["2", "Set device at the defined height and orientation; remain still for 30 seconds.", "Height, azimuth, pitch, roll."],
                ["3", "Capture three 10-second readings separated by 10 seconds.", "Bx, By, Bz, total field, sample rate."],
                ["4", "Repeat if any reading differs from the station median by more than the pre-registered tolerance.", "Repeat flag and reason."],
                ["5", "Describe lithology, visible structures, disturbance, weather, and nearby interference.", "Field notes and controlled terms."],
                ["6", "Take overview, ground, and close-detail photographs with a scale.", "Photo IDs."],
                ["7", "Collect a rock or water sample only when authorized and necessary.", "Sample ID and chain of custody."],
            ],
            [0.42 * inch, 3.55 * inch, 2.83 * inch],
        ),
        p("6. QUALITY CONTROL", "h1"),
    ]
    story += bullets(
        [
            "Use preassigned station IDs: OGP-[TRANSECT]-[SEQUENCE]. Never reuse an ID.",
            "Flag readings near vehicles, fencing, buried utilities, power lines, phones, tools, or other interference.",
            "Collect at least one duplicate station per ten ordinary stations and repeat the daily control station.",
            "Retain raw sensor files unchanged. Create cleaned and analysis-ready files as new versioned derivatives.",
            "Document every exclusion, correction, interpolation, or replacement in a machine-readable change log.",
            "Publish the protocol, field dictionary, and negative or null results with the data release.",
        ]
    )
    story += [
        p("7. CORE DATA DICTIONARY", "h1"),
        data_table(
            [
                ["Field", "Format", "Definition"],
                ["station_id", "text", "Unique OGP transect and sequence identifier."],
                ["timestamp_utc", "ISO 8601", "Coordinated Universal Time at start of reading."],
                ["latitude / longitude", "decimal degrees", "WGS84 coordinate with horizontal-accuracy estimate."],
                ["bx / by / bz / total_nt", "numeric", "Magnetic components and total field in nanotesla."],
                ["orientation", "degrees", "Azimuth, pitch, and roll during collection."],
                ["lithology / mineral_id", "controlled text", "Field identification with confidence and later verification status."],
                ["photo_ids / sample_ids", "text list", "Linked photographs and chain-of-custody identifiers."],
                ["qc_flags", "text list", "Interference, repeat, calibration, or protocol-deviation flags."],
            ],
            [1.55 * inch, 1.2 * inch, 4.05 * inch],
        ),
        PageBreak(),
        p("8. FIELD SAFETY AND ETHICS", "h1"),
    ]
    story += bullets(
        [
            "Obtain landowner or agency authorization before entry, marking, sampling, or equipment placement.",
            "Do not enter adits, shafts, unstable mine workings, private enclosures, or posted exclusion zones.",
            "Use a two-person field team where terrain or communication conditions warrant it; maintain a check-in plan.",
            "Stop for lightning, extreme heat, wildfire conditions, hazardous wildlife, unstable footing, or loss of communication.",
            "Minimize disturbance, pack out all materials, and avoid publishing sensitive cultural or ecological coordinates.",
        ]
    )
    story += [
        p("9. RELEASE PACKAGE", "h1"),
        p(
            "Release the signed protocol, device inventory, station plan, raw export, cleaned table, QC log, "
            "photo index, sample index, and README. Use a CC-BY license for eligible research outputs and "
            "retain restrictions required for privacy, safety, cultural resources, or land-management compliance."
        ),
    ]
    return build_pdf(
        "magnetometer-survey-protocol.pdf",
        "Magnetometer Survey Protocol",
        "Working protocol for the Old Glory Peak Transects A-D.",
        story,
    )


def bio_protocol() -> Path:
    story = title_block(
        "BIO-001 Psychophysiology Protocol",
        "Matched-community HRV and salivary-cortisol study framework",
    )
    story += [
        notice(
            "NOT IRB APPROVED. No recruitment, consent, data collection, or public claims may begin until a "
            "qualified Institutional Review Board has approved the final protocol and consent materials."
        ),
        p("1. RESEARCH QUESTION", "h1"),
        p(
            "In an adult volunteer sample, does participation in the Old Glory Peak field-station program "
            "correspond with longitudinal changes in resting heart-rate variability and diurnal salivary "
            "cortisol compared with a matched control community?"
        ),
        p("2. DESIGN", "h1"),
    ]
    story += bullets(
        [
            "Prospective, quasi-experimental, repeated-measures comparison of an Alpha Node and matched Control Node.",
            "Pre-registration on OSF before recruitment or analysis.",
            "Measurement schedule: 5-minute resting RMSSD recordings three times weekly; paired morning and evening saliva samples monthly.",
            "Observation window, sample size, matching variables, and six supplementary outcomes must be fixed in the IRB submission and pre-registration.",
        ]
    )
    story += [
        p("3. PARTICIPANTS", "h1"),
        p(
            "Proposed participants are adults age 18 or older who can understand the consent form and safely "
            "complete the procedures. Final inclusion, exclusion, pregnancy, medication, cardiovascular, "
            "endocrine, and acute-illness criteria require clinical and IRB review before use."
        ),
        p("4. PROCEDURES", "h1"),
        data_table(
            [
                ["Procedure", "Schedule", "Standardized conditions"],
                ["Resting HRV", "Three times weekly", "Polar H10 chest strap; seated or supine; 5-minute RMSSD segment after a defined stabilization period; same time window when practical."],
                ["Salivary cortisol", "Morning and evening, monthly", "Salivette collection; exact clock time recorded; food, caffeine, exercise, nicotine, sleep, medication, and acute illness documented."],
                ["Context survey", "At each session or scheduled interval", "Minimal covariates needed for interpretation; avoid collecting unnecessary sensitive information."],
                ["Field-program exposure", "Ongoing", "Attendance, task type, duration, and environmental conditions recorded without evaluating individual performance."],
            ],
            [1.3 * inch, 1.2 * inch, 4.3 * inch],
        ),
        p("5. HRV ACQUISITION", "h1"),
    ]
    story += bullets(
        [
            "Use the same sensor model and firmware where possible; record device identifier and firmware version.",
            "Document posture, time of day, recent exertion, caffeine, nicotine, alcohol, sleep, illness, and medications relevant to interpretation.",
            "Inspect beat-to-beat data for signal loss and artifacts using a pre-registered algorithm and threshold.",
            "Retain raw RR-interval files. Derive RMSSD in a versioned analysis pipeline without overwriting source data.",
        ]
    )
    story += [
        p("6. CORTISOL ACQUISITION", "h1"),
    ]
    story += bullets(
        [
            "Use one validated Salivette collection procedure and laboratory assay across all time points.",
            "Record wake time and actual collection time. Define the morning and evening windows before recruitment.",
            "Specify storage temperature, maximum pre-freeze interval, chain of custody, shipment, assay batch, and duplicate policy with the selected laboratory.",
            "Do not collect or ship specimens until biospecimen handling, exposure control, and disposal procedures are approved.",
        ]
    )
    story += [
        p("7. OUTCOMES AND ANALYSIS", "h1"),
    ]
    story += bullets(
        [
            "Primary physiological outcomes: resting RMSSD and pre-specified salivary-cortisol measure.",
            "Analysis: repeated-measures model or ANOVA appropriate to the final design, with assumptions and missing-data strategy pre-specified.",
            "Apply Bonferroni correction to the six supplementary outcomes described in the final pre-registration.",
            "Report effect sizes, uncertainty intervals, protocol deviations, exclusions, missingness, and negative results.",
            "Do not interpret association as causation in a non-randomized design.",
        ]
    )
    story += [
        p("8. RISKS AND SAFEGUARDS", "h1"),
    ]
    story += bullets(
        [
            "Foreseeable risks include temporary chest-strap discomfort or skin irritation, saliva-collection discomfort, fatigue, embarrassment, and privacy loss.",
            "Participants may pause or stop any procedure without penalty. Establish referral and adverse-event procedures before recruitment.",
            "Separate contact information from research records. Use coded study IDs and the minimum data necessary.",
            "Store identifiable linkage files offline with access limited to approved study personnel. Publish only de-identified or aggregated data.",
        ]
    )
    story += [
        p("9. GOVERNANCE AND OPEN SCIENCE", "h1"),
        p(
            "The final IRB determination, consent form, protocol, and statistical analysis plan control the "
            "study. Pre-registration must precede collection. Public releases must follow the consent scope, "
            "privacy review, biospecimen policy, and any restrictions required by the IRB."
        ),
        p("10. REQUIRED BEFORE ACTIVATION", "h1"),
    ]
    story += bullets(
        [
            "Named qualified principal investigator and scientific or clinical advisor.",
            "IRB-reviewed protocol, consent form, recruitment language, and data-security plan.",
            "Final sample size, matching rules, primary and supplementary outcomes, stopping rules, and compensation.",
            "Laboratory agreement, biospecimen SOP, adverse-event plan, and participant contact procedures.",
        ]
    )
    return build_pdf(
        "bio-001-psychophysiology-protocol.pdf",
        "BIO-001 Psychophysiology Protocol",
        "Working human-subjects protocol framework; not IRB approved.",
        story,
    )


def phase_one_plan() -> Path:
    story = title_block(
        "Phase 1 Action Plan",
        "Now through December 2026 / first 50 survey points",
    )
    story += [
        notice(
            "Planning schedule. Field access, fiscal-sponsor requirements, weather, safety, equipment lead time, "
            "and scientific review may change sequencing."
        ),
        p("PHASE 1 OUTCOME", "h1"),
        p(
            "By December 2026: fiscal sponsorship active; first 50 GPS-tagged points collected across the Old "
            "Glory Peak ridge transect; Transects A-D field-ready or complete as access permits; public OSF "
            "field log active; mineral identification catalog published."
        ),
        p("IMPLEMENTATION SCHEDULE", "h1"),
        data_table(
            [
                ["Window", "Primary actions", "Completion evidence"],
                ["Weeks 1-2", "Confirm legal name, fiscal-sponsor pathway, decision authority, document control, and risk register.", "Sponsor outreach log; roles; document index; risk register."],
                ["Weeks 3-4", "Confirm land access, agency contacts, permissions, no-entry zones, field communication, and heat plan.", "Written access record; maps; field safety plan; check-in protocol."],
                ["Weeks 5-6", "Acquire and inventory magnetometer, GPS, camera, mineral-test, water-test, and safety equipment.", "Asset register; serial numbers; calibration and maintenance log."],
                ["Weeks 7-8", "Lock Transect C station plan; reconnaissance for A, B, and D; establish daily control station.", "Station plan; reconnaissance notes; control-station photos."],
                ["Weeks 9-10", "Pilot the protocol at a small station set. Test export, photo naming, sample IDs, and QC rules.", "Pilot dataset; deviation log; revised protocol."],
                ["Weeks 11-14", "Collect the first structured Old Glory Peak field blocks under safe conditions.", "Signed field sheets; raw exports; photo and sample indexes."],
                ["Weeks 15-18", "Run duplicates and control repeats; review mineral IDs; resolve data-quality flags.", "QC report; cleaned derivative; catalog draft."],
                ["Weeks 19-20", "Publish protocol, README, field dictionary, and public field log framework on OSF.", "Persistent project record; versioned files; license."],
                ["Weeks 21-22", "Reach 50 accepted GPS-tagged points and publish Phase 1 dataset or documented partial release.", "Dataset release; exclusions and negative results."],
                ["Weeks 23-24", "Submit priority grants; publish financial summary and Phase 1 lessons; lock Phase 2 scope.", "Submission receipts; public summary; Phase 2 decision memo."],
            ],
            [0.85 * inch, 3.8 * inch, 2.15 * inch],
        ),
        p("WEEKLY OPERATING RHYTHM", "h1"),
    ]
    story += bullets(
        [
            "Monday: weather, access, safety, equipment, and station-plan review.",
            "Field day: two-person check-in where required; raw collection and same-day backup.",
            "Within 24 hours: upload to the offline repository, checksum source files, and complete the deviation log.",
            "Friday: QC review, issue list, public field-log entry, budget update, and next-week decision.",
            "Monthly: advisor or peer-method review and pre-registration amendment review when necessary.",
        ]
    )
    story += [
        p("DECISION GATES", "h1"),
        data_table(
            [
                ["Gate", "Proceed when", "Stop or revise when"],
                ["Access", "Permission and route conditions are documented.", "Ownership, agency, closure, or cultural-resource status is uncertain."],
                ["Safety", "Heat, fire, weather, communication, and staffing controls are acceptable.", "Any stop condition in the field safety plan is present."],
                ["Protocol", "Pilot data export and station repeats meet the pre-registered QC rule.", "Device behavior, interference, or data loss prevents repeatability."],
                ["Release", "Identifiers, coordinates, licenses, and sensitive-location review are complete.", "Privacy, safety, or land-management restrictions are unresolved."],
            ],
            [0.8 * inch, 3.0 * inch, 3.0 * inch],
        ),
        p("PHASE 2 HANDOFF", "h1"),
        p(
            "Phase 2 begins only after a review of field evidence, grants, access, construction readiness, water "
            "systems, ecological monitoring needs, insurance, and operating capacity. Moss monitoring and camera "
            "traps require site-specific ecological and privacy placement rules before installation."
        ),
    ]
    return build_pdf(
        "phase-1-action-plan.pdf",
        "Phase 1 Action Plan",
        "Week-by-week implementation plan through December 2026.",
        story,
    )


def budget_breakdown() -> Path:
    uses = [
        ["Field collection and personnel", "$27,000", "Field lead time, qualified field assistance, travel, documentation, and safe collection blocks."],
        ["Data stewardship and open science", "$9,000", "Data dictionary, QA/QC, repository preparation, versioning, licenses, and release documentation."],
        ["Dome materials and construction", "$12,000", "Douglas fir struts, non-metal joinery, fabrication, site preparation, transport, and construction safety."],
        ["Garden and water systems", "$9,000", "Cistern, gravity distribution, beds, soil inputs, irrigation, testing, and dryland planting materials."],
        ["Equipment and sensors", "$7,000", "Magnetometer/GPS support, water testing, mineral field kit, camera traps, moss monitoring, storage, and maintenance."],
        ["Insurance, permits, and safety", "$5,000", "Insurance, fiscal-sponsor and administrative costs, permissions, PPE, communication, and first aid."],
        ["Public documentation and workshops", "$3,000", "Accessible reports, printing, documentation, community briefings, and workshop materials."],
        ["Contingency", "$3,000", "Price movement, repairs, replacement, weather delays, and unplanned compliance needs."],
    ]
    story = title_block(
        "Annual Budget Breakdown",
        "$75,000 first-year planning allocation",
    )
    story += [
        notice(
            "Planning budget, not an award notice or final fiscal-sponsor budget. Final costs require quotes, "
            "allowability review, insurance review, and sponsor approval."
        ),
        p("FUNDING PLAN", "h1"),
        data_table(
            [
                ["Source", "Amount", "Share"],
                ["California climate investment", "$50,000", "66.7%"],
                ["Foundation grants", "$15,000", "20.0%"],
                ["Community and workshops", "$10,000", "13.3%"],
                ["TOTAL", "$75,000", "100.0%"],
            ],
            [3.7 * inch, 1.55 * inch, 1.55 * inch],
            right_align_last=True,
        ),
        p("PLANNED USES", "h1"),
        data_table(
            [["Use", "Amount", "Justification"]] + uses + [["TOTAL", "$75,000", "Every dollar tracked; annual open financial summary."]],
            [2.05 * inch, 0.85 * inch, 3.9 * inch],
        ),
        PageBreak(),
        p("COST PRINCIPLES", "h1"),
    ]
    story += bullets(
        [
            "People before objects: prioritize safe collection, stewardship, and documentation before expansion.",
            "No double charging: each expense is assigned to one purpose and one funding source.",
            "Document allowability, quote or price basis, approval, receipt, payment, and asset custody.",
            "Track restricted and unrestricted support separately under fiscal-sponsor rules.",
            "Publish an annual category-level financial summary without exposing protected personal or vendor information.",
        ]
    )
    story += [
        p("BUDGET CONTROL", "h1"),
        data_table(
            [
                ["Control", "Standard"],
                ["Approval", "Written approval threshold and delegated authority set by the fiscal sponsor."],
                ["Procurement", "Document competition or price reasonableness for material purchases."],
                ["Assets", "Tag durable equipment; record custodian, location, condition, and disposition."],
                ["Reconciliation", "Monthly ledger-to-receipt review and quarterly variance report."],
                ["Contingency", "Release only for documented needs; unused balance remains uncommitted."],
                ["Reporting", "Annual open summary plus funder-specific reports and closeout."],
            ],
            [1.25 * inch, 5.55 * inch],
        ),
        p("PLANNING NOTE", "h1"),
        p(
            "The funding-source labels describe a target mix. They do not indicate that an agency or foundation "
            "has committed funds. Construction and human-subjects activities require separate readiness and "
            "approval gates regardless of available cash."
        ),
    ]
    return build_pdf(
        "annual-budget-breakdown.pdf",
        "Annual Budget Breakdown",
        "Working $75,000 first-year funding and allocation plan.",
        story,
    )


def consent_template() -> Path:
    story = title_block(
        "Informed Consent Template",
        "BIO-001 / HRV and salivary-cortisol research",
    )
    story += [
        notice(
            "TEMPLATE - NOT IRB APPROVED. This form cannot be used to recruit or enroll participants. Complete "
            "all study-specific fields and obtain IRB approval before use."
        ),
        p("STUDY CONTACTS", "h1"),
        data_table(
            [
                ["Role", "Contact"],
                ["Study title", "BIO-001: Old Glory Peak Field Program and Longitudinal Psychophysiology"],
                ["Study lead", "Jesse Gawlik / Whole Body Foundation / jesse@wholebody.foundation"],
                ["Qualified principal investigator", "To be named before IRB submission."],
                ["IRB contact", "To be provided in the IRB-approved version."],
                ["Emergency contact", "Call 911 for a medical emergency; study-specific contact to be provided."],
            ],
            [1.75 * inch, 5.05 * inch],
        ),
        p("INVITATION", "h1"),
        p(
            "You are invited to consider a research study about physiological measurements and participation in "
            "a field-station program. This template explains the proposed study. The approved consent form may "
            "differ. Please ask questions before deciding."
        ),
        p("WHY IS THIS STUDY BEING DONE?", "h1"),
        p(
            "The proposed study will examine whether participation in the Old Glory Peak field-station program "
            "is associated with changes in resting heart-rate variability and salivary cortisol over time, "
            "compared with a matched control community. The study is observational and cannot prove causation."
        ),
        p("WHY MIGHT I BE ELIGIBLE?", "h1"),
        p(
            "The proposed study is intended for adults age 18 or older. Final eligibility, health exclusions, "
            "medication considerations, and control-matching requirements will be listed in the IRB-approved version."
        ),
        p("WHAT WILL HAPPEN IF I JOIN?", "h1"),
    ]
    story += bullets(
        [
            "You may be asked to wear a Polar H10 chest strap while resting for a 5-minute heart-rate variability recording up to three times each week.",
            "You may be asked to provide a morning and evening saliva sample using a Salivette collection tube once each month.",
            "You may be asked brief questions about collection time, sleep, exercise, caffeine, nicotine, illness, and medications that may affect interpretation.",
            "If you are in the field-program group, attendance, activity type, duration, and environmental conditions may be recorded.",
            "The final study duration, number of visits, sample size, and compensation will appear in the IRB-approved form.",
        ]
    )
    story += [
        PageBreak(),
        p("WHAT ARE THE RISKS OR DISCOMFORTS?", "h1"),
    ]
    story += bullets(
        [
            "The chest strap may cause temporary tightness, discomfort, or skin irritation.",
            "Saliva collection may cause minor discomfort, embarrassment, or a dry-mouth sensation.",
            "Questions about health or behavior may feel private or uncomfortable. You may skip any question when the approved protocol allows.",
            "There is a risk of loss of confidentiality whenever information is collected. The study will use coded IDs, restricted access, and minimum necessary data to reduce that risk.",
            "Unknown or unexpected risks are possible. The approved version will describe adverse-event reporting and whom to contact.",
        ]
    )
    story += [
        p("ARE THERE BENEFITS?", "h1"),
        p(
            "You may receive no direct benefit. The study may contribute to knowledge about field-program "
            "participation and physiological measurements. No health improvement is promised."
        ),
        p("DO I HAVE TO PARTICIPATE?", "h1"),
        p(
            "No. Participation is voluntary. You may decline or stop without penalty or loss of benefits to "
            "which you are otherwise entitled. The approved form will explain what happens to information and "
            "specimens already collected if you withdraw."
        ),
        p("HOW WILL MY INFORMATION BE PROTECTED?", "h1"),
    ]
    story += bullets(
        [
            "Research records will use a coded study ID. The identity key will be stored separately.",
            "Identifiable files will be kept in access-controlled offline storage available only to approved study personnel.",
            "Reports and open datasets will use de-identified or aggregated information. Rare combinations or sensitive locations may be withheld.",
            "Complete confidentiality cannot be guaranteed. The approved form will list who may inspect records, including the IRB and regulators when applicable.",
        ]
    )
    story += [
        p("WHAT HAPPENS TO MY SALIVA SAMPLE?", "h1"),
        p(
            "The approved form must state where samples are stored, how long they are retained, who can access "
            "them, whether they may be used for future research, and how they are destroyed. No future use is "
            "authorized by this working template."
        ),
        p("COSTS, PAYMENT, AND INJURY", "h1"),
        p(
            "The approved form must state whether there are costs, compensation, reimbursement, medical "
            "treatment, or compensation for research-related injury. Do not assume payment or coverage until "
            "those terms are approved in writing."
        ),
        p("QUESTIONS OR CONCERNS", "h1"),
        p(
            "For study questions, contact jesse@wholebody.foundation. The approved form will include the "
            "qualified principal investigator and an independent IRB contact for questions about participant rights."
        ),
        PageBreak(),
        p("CONSENT SIGNATURES", "h1"),
        p(
            "By signing the final IRB-approved version, you confirm that you read the form, had an opportunity "
            "to ask questions, received satisfactory answers, and voluntarily agree to participate. Signing "
            "this working template does not enroll anyone."
        ),
        Spacer(1, 18),
        data_table(
            [
                ["Participant", "Signature", "Date / time"],
                ["Printed name: __________________________", "____________________________", "________________"],
            ],
            [2.45 * inch, 2.65 * inch, 1.7 * inch],
        ),
        Spacer(1, 16),
        data_table(
            [
                ["Person obtaining consent", "Signature", "Date / time"],
                ["Printed name: __________________________", "____________________________", "________________"],
            ],
            [2.45 * inch, 2.65 * inch, 1.7 * inch],
        ),
        Spacer(1, 16),
        data_table(
            [
                ["Legally authorized representative, if applicable", "Relationship", "Signature / date"],
                ["Name: _________________________________", "________________", "________________________"],
            ],
            [3.2 * inch, 1.45 * inch, 2.15 * inch],
        ),
        Spacer(1, 18),
        notice(
            "DOCUMENT CONTROL: Replace this page with the IRB-stamped consent form after approval. Record the "
            "approved version number and date on every copy used for consent."
        ),
    ]
    return build_pdf(
        "informed-consent-template.pdf",
        "Informed Consent Template",
        "Working consent template for BIO-001; not IRB approved.",
        story,
    )


def investor_one_pager() -> Path:
    investor_styles = {
        "h1": ParagraphStyle(
            "InvestorH1",
            fontName="Times-Bold",
            fontSize=11,
            leading=12.5,
            textColor=MINERAL,
            spaceBefore=6,
            spaceAfter=3.5,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "InvestorH2",
            fontName="Helvetica-Bold",
            fontSize=7.2,
            leading=8.4,
            textColor=RUST,
            spaceBefore=4.5,
            spaceAfter=2.2,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "InvestorBody",
            fontName="Helvetica",
            fontSize=6.65,
            leading=8.35,
            textColor=INK,
            spaceAfter=3.2,
        ),
        "bullet": ParagraphStyle(
            "InvestorBullet",
            fontName="Helvetica",
            fontSize=6.35,
            leading=7.8,
            textColor=INK,
            leftIndent=8,
            firstLineIndent=-6,
            spaceAfter=1.1,
        ),
        "note": ParagraphStyle(
            "InvestorNote",
            fontName="Helvetica-Bold",
            fontSize=6.3,
            leading=8,
            textColor=MINERAL,
            spaceAfter=2,
        ),
        "metric": ParagraphStyle(
            "InvestorMetric",
            fontName="Times-Bold",
            fontSize=9.5,
            leading=10.5,
            textColor=MINERAL,
            alignment=TA_LEFT,
        ),
        "quote": ParagraphStyle(
            "InvestorQuote",
            fontName="Times-Bold",
            fontSize=14,
            leading=15.5,
            textColor=MINERAL,
            spaceAfter=3,
        ),
        "small": ParagraphStyle(
            "InvestorSmall",
            fontName="Helvetica",
            fontSize=5.8,
            leading=7.2,
            textColor=MUTED,
            spaceAfter=2,
        ),
    }

    def ip(text: str, style: str = "body") -> Paragraph:
        return Paragraph(text, investor_styles[style])

    def ib(items: list[str]) -> list[Paragraph]:
        return [ip(f"- {item}", "bullet") for item in items]

    def block(title: str, paragraphs: list[Paragraph]) -> KeepTogether:
        return KeepTogether([ip(title, "h2"), *paragraphs])

    def investor_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
        canvas.setFillColor(MINERAL)
        canvas.rect(0, PAGE_HEIGHT - 0.18 * inch, PAGE_WIDTH, 0.18 * inch, fill=1, stroke=0)
        canvas.setFillColor(GREEN)
        canvas.setFont("Helvetica-Bold", 6.3)
        canvas.drawString(0.48 * inch, PAGE_HEIGHT - 0.42 * inch, "WHOLE BODY FOUNDATION")
        canvas.setFillColor(INK)
        canvas.setFont("Times-Bold", 21)
        canvas.drawString(
            0.48 * inch,
            PAGE_HEIGHT - 0.76 * inch,
            "Permanent Field Infrastructure",
        )
        canvas.setFont("Times-Bold", 18)
        canvas.drawString(
            0.48 * inch,
            PAGE_HEIGHT - 1.04 * inch,
            "for Public-Interest Science",
        )
        canvas.setFillColor(MINERAL)
        canvas.setFont("Helvetica", 6.7)
        canvas.drawString(
            0.48 * inch,
            PAGE_HEIGHT - 1.25 * inch,
            "OLD GLORY PEAK / MORONGO VALLEY / SAN BERNARDINO COUNTY, CALIFORNIA / EST. 2026",
        )
        canvas.setFillColor(colors.Color(RUST.red, RUST.green, RUST.blue, alpha=0.1))
        canvas.roundRect(
            PAGE_WIDTH - 2.45 * inch,
            PAGE_HEIGHT - 0.81 * inch,
            1.95 * inch,
            0.32 * inch,
            4,
            fill=1,
            stroke=0,
        )
        canvas.setFillColor(RUST)
        canvas.setFont("Helvetica-Bold", 5.8)
        canvas.drawCentredString(
            PAGE_WIDTH - 1.475 * inch,
            PAGE_HEIGHT - 0.68 * inch,
            "PLANNING BRIEF / JULY 2026",
        )
        canvas.setStrokeColor(GREEN)
        canvas.setLineWidth(0.65)
        canvas.line(
            0.48 * inch,
            PAGE_HEIGHT - 1.38 * inch,
            PAGE_WIDTH - 0.48 * inch,
            PAGE_HEIGHT - 1.38 * inch,
        )
        canvas.line(0.48 * inch, 0.47 * inch, PAGE_WIDTH - 0.48 * inch, 0.47 * inch)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 5.4)
        canvas.drawString(
            0.48 * inch,
            0.27 * inch,
            "CONTACT@WHOLEBODY.FOUNDATION / WWW.WHOLEBODY.FOUNDATION / OSF PROJECT PENDING",
        )
        canvas.drawRightString(
            PAGE_WIDTH - 0.48 * inch,
            0.27 * inch,
            "PLANNING ESTIMATES - NOT AN OFFERING MEMORANDUM",
        )
        canvas.restoreState()

    left = Frame(
        0.48 * inch,
        0.58 * inch,
        3.42 * inch,
        8.93 * inch,
        leftPadding=0,
        rightPadding=0.12 * inch,
        topPadding=0,
        bottomPadding=0,
        id="left",
    )
    right = Frame(
        4.02 * inch,
        0.58 * inch,
        3.5 * inch,
        8.93 * inch,
        leftPadding=0.12 * inch,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
        id="right",
    )

    story: list = [
        ip("THE OPPORTUNITY", "h1"),
        ip(
            "Build what must last. Whole Body Foundation is planning land acquisition, permanent wooden "
            "infrastructure, and a field station for multidisciplinary research in the high desert of "
            "Southern California. The model prioritizes ownership, durable construction, and open evidence."
        ),
        ip("WHAT WE'RE BUILDING", "h1"),
        block(
            "PHASE 1 - TETRAHEDRON GARDEN",
            ib(
                [
                    "12 triangular raised beds in a Flower of Life pattern.",
                    "1,000-gallon copper cistern, solar gnomon, orchard ring, and 6 cold frames.",
                    "Planning range: $8,000-$12,000 / Target duration: 90 days.",
                ]
            ),
        ),
        block(
            "PHASE 2 - FOUR ELEMENTAL DOMES",
            ib(
                [
                    "Four 10-foot, 2V Douglas fir domes for EARTH, FIRE, AIR, and WATER practices.",
                    "Hardwood dowel joinery and hide glue; no metal fasteners.",
                    "Planning range: $700-$900 per dome / 8 weeks per structure.",
                ]
            ),
        ),
        block(
            "PHASE 3 - DODECAHEDRON GREAT HALL",
            ib(
                [
                    "50-75 person wooden hall with nonagonal base and copper-paneled acoustic dome.",
                    "Three seating tiers, stained glass, and a central presentation platform.",
                    "Planning range: $150,000-$200,000 / Target duration: 6 months.",
                ]
            ),
        ),
        block(
            "PHASE 4 - QUINCUNX RESIDENTIAL CLUSTERS",
            ib(
                [
                    "Two clusters of six wooden dome homes, each centered on a pool.",
                    "Privacy landscape, shared decks, fire areas, and desert-adapted planting.",
                    "Planning range: $35,000-$45,000 per home / 3 months per home.",
                ]
            ),
        ),
        Spacer(1, 4),
        Table(
            [[ip("TOTAL INITIAL CAMPUS BUILDOUT", "note"), ip("$750K-$1.2M", "metric")]],
            colWidths=[2.05 * inch, 1.1 * inch],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.Color(GREEN.red, GREEN.green, GREEN.blue, alpha=0.12)),
                    ("BOX", (0, 0), (-1, -1), 0.7, GREEN),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            ),
        ),
        Spacer(1, 16),
        ip(
            "We do not rent what we can own.<br/>We do not lease what we can build.",
            "quote",
        ),
        ip(
            "The long-term objective is durable field infrastructure that compounds research, training, and community value over time.",
            "small",
        ),
        FrameBreak(),
        ip("THE RESEARCH MODEL", "h1"),
        ip(
            "<b>Every claim backed by a mechanism. Every measurement tied to a GPS coordinate. "
            "Every dataset open and reproducible.</b>",
            "note",
        ),
        block(
            "1 / ENVIRONMENTAL GEOPHYSICS",
            ib(
                [
                    "Magnetometer transects calibrated against USGS aeromagnetic data.",
                    "Four survey lines across the Pinto, Morongo Valley, and Emerson/Landers fault systems.",
                    "Rock identification and water testing for ORP, pH, heavy metals, and mineral content.",
                ]
            ),
        ),
        block(
            "2 / COMMUNITY PSYCHOPHYSIOLOGY",
            ib(
                [
                    "Planned Polar H10 HRV/RMSSD recordings and monthly salivary cortisol collection.",
                    "IRB review is required before enrollment or data collection; protocol pre-registration will follow approval.",
                ]
            ),
        ),
        block(
            "3 / NETWORK AND SYSTEMS SCIENCE",
            ib(
                [
                    "Decision latency, local economic velocity, and fractal scaling of community networks.",
                    "Open-data release is planned under CC-BY, including negative results.",
                ]
            ),
        ),
        ip("CURRENT STATUS / JULY 2026", "h1"),
        *ib(
            [
                "<b>LIVE:</b> wholebody.foundation and the Foundation grant site.",
                "<b>COMPLETE:</b> locked master-plan render package.",
                "<b>IMPLEMENTED:</b> procedural Phase 1 interactive garden model.",
                "<b>PENDING:</b> Explorers Club Rising Explorer grant ($2K; Aug. 31, 2026 deadline).",
                "<b>INQUIRY:</b> fiscal sponsorship discussions.",
                "<b>PHASE 0:</b> Morongo Valley land search.",
            ]
        ),
        ip("FUNDING REQUIREMENTS", "h1"),
        block(
            "FIRST-YEAR OPERATIONS - $75,000",
            ib(
                [
                    "Field personnel: $45,000 / Equipment: $15,000.",
                    "Data stewardship: $5,000 / Insurance, permits, legal: $8,000.",
                    "Documentation and website maintenance: $2,000.",
                ]
            ),
        ),
        block(
            "FIVE-YEAR CAMPUS PLAN - $1,200,000",
            ib(
                [
                    "Land acquisition: $400,000 / Phase 1-2 construction: $150,000.",
                    "Great Hall: $200,000 / 12-home residential program: $450,000.",
                ]
            ),
        ),
        ip("PRIMARY FUNDING PATHS", "h1"),
        *ib(
            [
                "CalEPA Environmental Justice grants: $50K-$500K.",
                "Explorers Club Rising Explorer: $2,000.",
                "Private donors, community supporters, and in-kind land contributions.",
            ]
        ),
        Spacer(1, 3),
        ip(
            "Planning ranges are preliminary and subject to site control, engineering, permitting, insurance, "
            "contractor pricing, and regulatory review. No human-subject research begins without required approval.",
            "small",
        ),
    ]

    path = OUTPUT_DIR / "investor-one-pager.pdf"
    doc = BaseDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=0,
        rightMargin=0,
        topMargin=0,
        bottomMargin=0,
        title="Whole Body Foundation Investor One-Pager",
        author="Whole Body Foundation",
        subject="Planning brief for the Old Glory Peak field station and campus infrastructure.",
        pageTemplates=[
            PageTemplate(id="InvestorOnePager", frames=[left, right], onPage=investor_page)
        ],
    )
    doc.build(story)
    shutil.copy2(path, PUBLIC_DIR / path.name)
    return path


def main():
    paths = [
        investor_one_pager(),
        project_summary(),
        magnetometer_protocol(),
        bio_protocol(),
        phase_one_plan(),
        budget_breakdown(),
        consent_template(),
    ]
    for path in paths:
        print(path)


if __name__ == "__main__":
    main()
