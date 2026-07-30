export default function PublicFieldMap() {
  return (
    <figure className="survey-map public-field-map" aria-labelledby="public-field-map-title">
      <img
        src="/maps/morongo-valley-usgs-imagery-topo.jpg"
        alt="Public USGS aerial and topographic context for Morongo Valley and the surrounding wilderness"
        width={1600}
        height={1600}
        loading="lazy"
        decoding="async"
      />
      <div className="survey-map-tone" aria-hidden="true" />
      <div className="survey-map-heading" id="public-field-map-title">
        <span>MORONGO VALLEY / REGIONAL CONTEXT</span>
        <strong>PUBLIC USGS AERIAL + TOPOGRAPHY</strong>
      </div>
      <div className="survey-map-legend" aria-label="Public map scope">
        <span><i className="fault" />PUBLIC BASE MAP</span>
        <span>NO PROJECT SITING OVERLAYS</span>
      </div>
      <figcaption>
        Public base imagery and contours:{" "}
        <a
          href="https://www.usgs.gov/tools/national-map-viewer"
          target="_blank"
          rel="noreferrer"
        >
          USGS The National Map
        </a>
        . Foundation-authored station, transect, and construction-planning
        layers are intentionally omitted. Not for navigation.
      </figcaption>
    </figure>
  );
}
