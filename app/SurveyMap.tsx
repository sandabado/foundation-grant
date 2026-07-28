const faultTraces = [
  { d: "M477 595.9 L491.2 585.6 L496.4 581.6", certainty: "mapped" },
  { d: "M421.3 636.7 L417.8 639.6 L412.3 643.7", certainty: "inferred" },
  { d: "M492.6 603.7 L477.7 612.3 L471.5 615.8 L465.2 619.4 L459.9 622.4 L455.9 624.8 L453.5 626.3 L450.9 627.6 L447.7 628.8 L444.4 631 L440 633.6 L434.9 636.7 L430.3 639.8 L425.5 643.4 L419.4 647.8 L412.6 652.5 L402.6 659.8 L396.3 665", certainty: "inferred" },
  { d: "M342 697.7 L338.3 700.6 L335.6 702.6 L332.1 703.9 L328.3 704.9 L325.6 705.7 L324.1 706.4 L322.8 707.1 L321.2 708 L319.1 708.3", certainty: "mapped" },
  { d: "M497.9 580.8 L509.3 572.4 L516.6 567.2 L525.9 560.4 L532.5 555.3 L537.4 551.7 L542.4 547.8 L546.5 544.4 L551.8 540.5 L558.3 535.3 L565.1 529.8 L572.2 524.4 L580 518.7 L589.9 510.9", certainty: "inferred" },
  { d: "M1130.6 32.9 L1120.7 41.1 L1114.2 45.6 L1108.6 49.1 L1103.5 52 L1097.7 55.9 L1092.4 58.9 L1087.1 61 L1080.9 62.8 L1073.1 65.5 L1064.9 68.7 L1056.9 71.9 L1049.5 75.4 L1041.7 79.4 L1034.9 83.2 L1026.7 87.3 L1016.6 92.4 L1009 96.8 L1000.8 101.5 L988.3 107.7 L975.6 112.8 L963.8 117.7 L953.6 121 L941.4 125 L930.6 128.7 L917.5 132.8 L899.1 138.7 L866.6 149.2 L846.9 155.5 L829.3 160.6 L811.3 165.6 L786.2 171.8 L772.1 175.9 L754 180.6 L735 185.6 L716.6 190.2 L694 196.2 L672.2 201.7", certainty: "inferred" },
  { d: "M662.7 499.1 L656.8 504.2 L652.6 507.5 L649.3 509.9 L642.7 514.3", certainty: "inferred" },
  { d: "M476.5 596.7 L469.4 602.1 L461.6 607.8 L455.5 612.4 L451.4 615.7", certainty: "inferred" },
  { d: "M422.3 636.1 L425.7 633.3 L430.4 630.1 L435.3 626.4 L440.6 622.7 L450.3 616.3", certainty: "mapped" },
  { d: "M245.3 232.1 L261.8 231.6 L272.3 231.4 L282.6 231 L293.2 230.7 L304.5 230.4 L316.2 230 L329.5 229.4 L344.9 228.7 L355.1 228.7 L364.2 228.5 L372.6 228.6 L378.5 228.7 L383.9 229 L390.4 229.1 L398.6 229.1 L405.4 229 L409.9 229.1 L413.8 229.2 L420.2 229.7 L428.8 229.9 L438.8 229.7 L448.6 229.7 L454.3 229.3 L460.5 229 L468.2 229.2 L476.8 229.7 L485 229.4 L493.5 229.1 L505.2 229.8", certainty: "inferred" },
  { d: "M527.1 569.7 L544 558.2 L553 551.9 L560.4 546.8 L566.8 542.2 L574 536.4 L581.3 530.6 L588.1 525.4 L595 519.9 L605.8 512.8", certainty: "inferred" },
  { d: "M1038.6 221.4 L1017.3 230.6 L1001.4 238.7 L987.6 245.6 L975.8 252 L962.7 259.4 L946 268.7 L936.8 274.1 L930.7 277.7 L923.9 281.5 L917.3 284.6 L910.7 288.6 L901.2 295.2 L889.3 303.3 L879 310.7 L869.6 317 L860.1 324.1 L850.6 331.8 L841 338.3 L828.6 347.9", certainty: "inferred" },
  { d: "M481.5 602.7 L501.2 589.5 L512.4 581.1 L526.8 570.2", certainty: "mapped" },
  { d: "M449.5 626.7 L455.4 621.3 L460.8 617 L465.6 613.5 L470.7 609.8 L480.1 603.3", certainty: "inferred" },
  { d: "M519.7 223.1 L526 222.1 L532.5 221.3 L534.9 221", certainty: "inferred" },
  { d: "M410.9 645.1 L394.8 656.8 L385.3 663.9 L377.3 669.8", certainty: "mapped" },
  { d: "M492.8 603.4 L504.4 596.5 L510.5 592.8 L518.3 588.2 L526.7 583.6 L535.9 578.7 L544.6 573.6 L553.1 569 L561.6 564.5 L570.1 559.5 L579.3 554 L588.6 548.4 L598 542.6 L609.1 535.5 L640.5 516", certainty: "mapped" },
  { d: "M550.1 573.4 L572 562.4 L584.3 556.3 L594.3 551.5 L603.4 547.1 L612.3 542.6 L621.2 538.1 L630.3 533.3 L639.7 528.6 L653.2 522.5 L677 511.9", certainty: "mapped" },
  { d: "M376.6 669.9 L369.8 673.2 L368.2 674.4 L366.2 676.1 L362.9 679.3 L359.3 683.7 L353.6 689 L349 693.2 L346 694.9 L343.9 696.3 L342.2 699.2 L339.2 703.8 L336.7 706.5 L334.5 708.6 L332.4 709.9 L327.2 712.8 L323.4 714.6 L320.8 715 L313.1 712.6 L311 712.1 L310.1 711.3 L308.7 710.9 L307.2 711.1 L305.1 711.8 L303 712.5 L301.3 713.2 L300.1 713.4 L299.4 713.9 L299 715.2 L298.1 715.8 L297.2 716 L296 715.7 L295 715.1 L290.3 713.1 L289.2 712.1", certainty: "mapped" },
  { d: "M210.5 229.2 L219.7 230.9 L225.4 232 L233.1 233.3 L239.1 233.9 L242.3 233.9", certainty: "mapped" },
  { d: "M827.5 348.6 L791.3 372.9 L773.7 385.3 L756.9 396.2 L746.2 403.7 L737.6 409.5 L729.2 415 L718.3 422.8 L709 430.2 L699.9 437.1 L691.4 444.3 L684.7 451 L679.6 456.7 L675.5 462.2 L671.8 468.1 L668.8 474 L667 481 L663 497.3", certainty: "mapped" },
  { d: "M670.8 201.9 L645.4 206 L631.6 208 L620.1 209.6 L607.2 211.3 L595.6 212.8 L585.6 214.5 L571.9 216.1 L536.3 220.6", certainty: "mapped" },
  { d: "M-56.1 268.3 L-47.6 266.4 L-42.7 264.9 L-39.3 263.6 L-36 262.5 L-33.1 261.5 L-29.5 260.4 L-26 258.8 L-23.1 257.2 L-20.6 255.9 L-17.6 254.4 L-15.3 253.3 L-11.5 252.3 L-7.5 251.1 L-3.1 249.8 L1.3 248.6 L5.3 247.6 L9.1 246.6 L13.4 245.6 L17.2 244.6 L21.3 243.5 L25.9 242.5 L31.2 241.5 L38.6 239.4 L45.2 237.7 L50.6 236.3 L57.6 234.6 L63.6 233.5 L69.8 232.6 L78.4 231.2 L86.8 229.8 L94.5 228.7 L104.2 227.5 L112.9 226.5 L118.5 226.4 L123.3 225.9 L128.5 225.1 L134.2 224.2 L140.9 223.4 L147.1 223.2 L154.5 223.2 L160.7 223.7 L166.2 224.3 L172 225.2 L176.2 225.8 L180.3 225.9 L184.7 226.1 L190.6 226.5 L197.3 227.4 L209.1 229", certainty: "mapped" },
] as const;

const ridgeStations = Array.from({ length: 9 }, (_, index) => 365 + index * 4);

export default function SurveyMap() {
  return (
    <figure className="survey-map" aria-labelledby="survey-map-title">
      <img
        src="/maps/morongo-valley-usgs-imagery-topo.jpg"
        alt=""
        width={1600}
        height={1600}
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <div className="survey-map-tone" aria-hidden="true" />
      <svg
        viewBox="0 0 1000 1000"
        role="img"
        aria-labelledby="survey-map-title survey-map-description"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="survey-map-title">Morongo Valley terrain and survey planning map</title>
        <desc id="survey-map-description">
          Official USGS aerial topography and fault traces with one fixed ridge
          transect and three field-siting corridors that remain provisional.
        </desc>

        <g className="fault-traces" aria-label="USGS mapped fault traces">
          {faultTraces.map((trace, index) => (
            <path
              key={`${trace.certainty}-${index}`}
              className={trace.certainty}
              d={trace.d}
            />
          ))}
        </g>

        <g className="survey-proposed survey-a" aria-label="Transect A planning corridor">
          <path d="M430 177 L430 282" />
          <circle cx="430" cy="230" r="7" />
          <text x="447" y="184">
            <tspan>TRANSECT A</tspan>
            <tspan x="447" dy="16">FIELD SITING PENDING</tspan>
          </text>
        </g>

        <g className="survey-proposed survey-b" aria-label="Transect B planning corridor">
          <path d="M492 526 L565 630" />
          <circle cx="529" cy="579" r="7" />
          <text x="578" y="626">
            <tspan>TRANSECT B</tspan>
            <tspan x="578" dy="16">FIELD SITING PENDING</tspan>
          </text>
        </g>

        <g className="survey-fixed survey-c" aria-label="Transect C survey specification">
          <path d="M365 483 L397 483" />
          {ridgeStations.map((x, index) => (
            <circle key={index} cx={x} cy="483" r="2.7" />
          ))}
          <path className="survey-leader" d="M381 476 L333 430 L257 430" />
          <text x="257" y="409">
            <tspan>OLD GLORY RIDGE / C</tspan>
            <tspan x="257" dy="16">400 M · 9 STATIONS · 50 M</tspan>
          </text>
        </g>

        <g className="survey-proposed survey-d" aria-label="Transect D proposed mine-area grid">
          <rect x="325" y="522" width="56" height="48" />
          <path d="M343.7 522 V570 M362.3 522 V570 M325 538 H381 M325 554 H381" />
          <text x="300" y="591">
            <tspan>TRANSECT D / MINE GRID</tspan>
            <tspan x="300" dy="16">BOUNDARY PENDING ACCESS + SAFETY</tspan>
          </text>
        </g>

        <g className="map-north" aria-label="North arrow">
          <path d="M927 102 L943 54 L959 102 L943 94 Z" />
          <text x="943" y="132" textAnchor="middle">N</text>
        </g>

        <g className="map-scale" aria-label="Two kilometer scale">
          <path d="M770 895 H925 M770 887 V903 M925 887 V903" />
          <text x="770" y="921">0</text>
          <text x="925" y="921" textAnchor="end">2 KM</text>
        </g>
      </svg>

      <div className="survey-map-heading" aria-hidden="true">
        <span>MORONGO VALLEY / OLD GLORY CORRIDOR</span>
        <strong>USGS AERIAL + TOPOGRAPHY</strong>
      </div>

      <div className="survey-map-legend" aria-label="Map legend">
        <span><i className="fault" />USGS FAULT TRACE</span>
        <span><i className="fixed" />FIXED SURVEY SPEC</span>
        <span><i className="proposed" />FIELD SITING PENDING</span>
      </div>

      <figcaption>
        Base imagery and contours:{" "}
        <a href="https://www.usgs.gov/tools/national-map-viewer" target="_blank" rel="noreferrer">
          USGS The National Map
        </a>
        . Fault geometry: USGS Quaternary Fault and Fold Database. Planning
        overlay: Whole Body Foundation protocol v1. Not for navigation.
      </figcaption>
    </figure>
  );
}
