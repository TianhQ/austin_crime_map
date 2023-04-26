import { map } from "./Map.js";
import { BabylonClusterLayer } from "./BabylonClusterLayer.js";

const loadData = (type, year) => {
  let dataID = `${type}_${year}`;
  let path = `./data/${dataID}.geojson`;
  let sourceID = `source_${dataID}`;
  return new Promise((resolve, reject) => {
    fetch(path)
      .then((response) => response.json())
      .then((data) => {
        map.addSource(sourceID, {
          type: "geojson",
          data: data,
          cluster: true,
          clusterMaxZoom: 12, // Max zoom to cluster points on
          clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        });
        let rtn = { dataID, sourceID, data };
        console.log(rtn);
        resolve(rtn);
      })
      .catch((err) => {
        reject(new Error(`Err-cannot fetch data - ${path}`));
      });
  });
};

let toggleButtons = document.querySelectorAll(".filter__button");
const resetBtn = document.querySelector(".filter__button--reset");

let selectedValue = null;
const alive3DLayers = [];
const alive2DUnClusteredLayers = [];

toggleButtons.forEach((button) => {
  button.addEventListener("click", function () {
    if (button.classList.contains("active")) {
      button.classList.remove("active");
      selectedValue = null; /* Set selectedValue to null when deselecting */
    } else {
      button.classList.add("active");
      toggleButtons.forEach(function (btn) {
        if (btn !== button) {
          btn.classList.remove("active");
        }
      });
      selectedValue = button.getAttribute("data-value");
    }
  });
});

const create3DLayer = function (id, data) {
  return new Promise((resolve, reject) => {
    const babylonLayer = new BabylonClusterLayer(`babylon-${id}`, data);
    map
      .addLayer(babylonLayer)
      .then(resolve(alive3DLayers.push(`babylon-${id}`)))
      .catch(() => {
        reject(new Error("Err-cannot create 3d layer"));
      });
  });
};

const create2DCircleClustered = function (id, sourceName, type) {
  return new Promise((resolve, reject) => {
    map.addLayer({
      id: `2d-circle-clustered-${id}`,
      type: "circle",
      source: sourceName,
      filter: ["has", "point_count"],
      paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          50,
          "#f1f075",
          100,
          "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 10, 50, 20, 100, 40],
      },
    });
    map.addLayer({
      id: `2d-circle-clustered-${id}-count`,
      type: "symbol",
      source: sourceName,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });
    resolve(console.log("loaded 2d clustered"));
  }).catch(() => {
    reject(new Error("Err-cannot create 2d clustered layer"));
  });
};

const create2DCircleUnclustered = function (id, sourceName) {
  return new Promise((resolve, reject) => {
    map.addLayer({
      id: `2d-circle-unclustered-${id}-count`,
      type: "circle",
      source: sourceName,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#11b4da",
        "circle-radius": 4,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });
    resolve(alive2DUnClusteredLayers.push(`2d-circle-unclustered-${id}-count`));
  }).catch(() => {
    reject(new Error("Err-cannot create 2d unclustered layer"));
  });
};

const addDataSource = (sourceID) => {
  return new Promise((resolve, reject) => {
    map.addSource(sourceID, {
      type: "geojson",
      data: data,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 20, // Radius of each cluster when clustering points (defaults to 50)
    });
    resolve(console.log("loaded data"));
  }).catch(() => {
    console.log("error loading data");
  });
};

// map.on("load", () => {
//   // loadData("crime_d", 2019)
//   //   .then((result) => {
//   //     console.log(result);
//   //     addDataSource;
//   //     create3DLayer(result.dataID, result.data);
//   //     create2DCircleClustered(result.dataID, result.sourceID);
//   //     create2DCircleUnclustered(result.dataID, result.sourceID);
//   //     resolve(console.log("crime_d loaded"));
//   //   })
//   //   .catch(() => new Error(`Err- cannot load layers`));
//   // loadData("all", 2019)
//   //   .then((result) => {
//   //     console.log(result);
//   //     addDataSource;
//   //     create3DLayer(result.dataID, result.data);
//   //     create2DCircleClustered(result.dataID, result.sourceID);
//   //     create2DCircleUnclustered(result.dataID, result.sourceID);
//   //     resolve(console.log("crime_d loaded"));
//   //   })
//   //   .catch(() => new Error(`Err- cannot load layers`));
// });

// map.on("zoom", () => {
//   if (map.getZoom() > 13) {
//     alive3DLayers.forEach((layerID) => {
//       map.setLayoutProperty(layerID, "visibility", "visible");
//     });
//     alive2DUnClusteredLayers.forEach((layerID) => {
//       map.setLayoutProperty(layerID, "visibility", "none");
//     });
//   } else {
//     // alive3DLayers.forEach((layerID) => {
//     //   map.setLayoutProperty(layerID, "visibility", "none");
//     // });
//     alive2DUnClusteredLayers.forEach((layerID) => {
//       map.setLayoutProperty(layerID, "visibility", "none");
//     });
//   }
// });
