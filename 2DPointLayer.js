import { map } from "./Map.js";
import { fetchData } from "./dataloader.js";

const vc = ["all", ["get", "Crime Group"], "v"];
const dc = ["all", ["get", "Crime Group"], "d"];
const pc = ["all", ["get", "Crime Group"], "p"];
const mc = ["all", ["get", "Crime Group"], "c"];

const colors = ["#FF7B54", "#FFB26B", "#FFD56F", "#939B62", "#3b3b3b"];

const mapGLLoadDataSource = () => {
  return new Promise((resolve, reject) => {
    fetchData()
      .then((data) => {
        let sourceID = `source_all_data`;
        map.addSource(sourceID, {
          type: "geojson",
          data: data,
          cluster: true,
          clusterMaxZoom: 20, // Max zoom to cluster points on
          clusterRadius: 30, // Radius of each cluster when clustering points (defaults to 50)
          clusterProperties: {
            // keep separate counts for each magnitude category in a cluster
            vc: ["+", ["case", ["==", ["get", "Crime Group"], "v"], 1, 0]],
            dc: ["+", ["case", ["==", ["get", "Crime Group"], "d"], 1, 0]],
            mc: ["+", ["case", ["==", ["get", "Crime Group"], "m"], 1, 0]],
            pc: ["+", ["case", ["==", ["get", "Crime Group"], "p"], 1, 0]],
          },
        });
        resolve(sourceID);
      })
      .catch((err) => {
        reject(new Error(`Err-cannot fetch data - ${path}`));
      });
  });
};

map.on("load", () => {
  mapGLLoadDataSource().then((sourceID) => {
    map.addLayer({
      id: "2d_clustered_all_data",
      type: "circle",
      source: sourceID,
      filter: ["!=", "cluster", true],
      paint: {
        "circle-color": [
          "case",
          vc,
          colors[0],
          dc,
          colors[1],
          pc,
          colors[2],
          mc,
          colors[3],
          colors[4],
        ],
        "circle-opacity": 0.6,
        "circle-radius": 12,
      },
    });
    map.addLayer({
      id: "2d_clustered_all_data_label",
      type: "symbol",
      source: sourceID,
      filter: ["!=", "cluster", true],
      layout: {
        "text-field": [
          "number-format",
          ["get", "Count"],
          { "min-fraction-digits": 0, "max-fraction-digits": 0 },
        ],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 10,
      },
      paint: {
        "text-color": "black",
      },
    });
    const markers = {};
    let markersOnScreen = {};
    function updateMarkers() {
      const newMarkers = {};
      const features = map.querySourceFeatures(sourceID);
      // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
      // and add it to the map if it's not there already
      for (const feature of features) {
        const coords = feature.geometry.coordinates;
        const props = feature.properties;
        if (!props.cluster) continue;
        const id = props.cluster_id;
        let marker = markers[id];
        if (!marker) {
          const el = createDonutChart(props);
          marker = markers[id] = new mapboxgl.Marker({
            element: el,
          }).setLngLat(coords);
        }
        newMarkers[id] = marker;
        if (!markersOnScreen[id]) marker.addTo(map);
      }
      // for every marker we've added previously, remove those that are no longer visible
      for (const id in markersOnScreen) {
        if (!newMarkers[id]) markersOnScreen[id].remove();
      }
      markersOnScreen = newMarkers;
    }
    map.on("render", () => {
      if (!map.isSourceLoaded(sourceID)) return;
      updateMarkers();
    });
  });
});

// code for creating an SVG donut chart from feature properties
function createDonutChart(props) {
  const offsets = [];
  const counts = [props.vc, props.pc, props.dc, props.mc];
  let total = 0;
  for (const count of counts) {
    offsets.push(total);
    total += count;
  }
  const fontSize =
    total >= 1000 ? 18 : total >= 100 ? 16 : total >= 10 ? 14 : 12;
  const r = total >= 1000 ? 30 : total >= 100 ? 20 : total >= 10 ? 10 : 5;
  const r0 = Math.round(r * 0.6);
  const w = r * 2;

  let html = `<div>
<svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`;

  for (let i = 0; i < counts.length; i++) {
    html += donutSegment(
      offsets[i] / total,
      (offsets[i] + counts[i]) / total,
      r,
      r0,
      colors[i]
    );
  }
  html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
<text dominant-baseline="central" transform="translate(${r}, ${r})">
${total.toLocaleString()}
</text>
</svg>
</div>`;

  const el = document.createElement("div");
  el.innerHTML = html;
  return el.firstChild;
}

function donutSegment(start, end, r, r0, color) {
  if (end - start === 1) end -= 0.00001;
  const a0 = 2 * Math.PI * (start - 0.25);
  const a1 = 2 * Math.PI * (end - 0.25);
  const x0 = Math.cos(a0),
    y0 = Math.sin(a0);
  const x1 = Math.cos(a1),
    y1 = Math.sin(a1);
  const largeArc = end - start > 0.5 ? 1 : 0;

  // draw an SVG path
  return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
    r + r * y0
  } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${r + r0 * x1} ${
    r + r0 * y1
  } A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
    r + r0 * y0
  }" fill="${color}" />`;
}
