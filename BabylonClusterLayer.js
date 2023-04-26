import { createBabylonBars } from "./BabylonRender.js";
// import { sourceData } from "./mapController.js";
import { map } from "./Map.js";
import { fetchData } from "./dataloader.js";

export class BabylonClusterLayer {
  constructor(id, source) {
    this.id = id;
    this.type = "custom";
    this.renderingMode = "3d";
    this.source = source;
    this.superCluster = new Supercluster({
      radius: 30, // Clustering radius in pixels
      maxZoom: 20, // Maximum zoom level for clustering
      minZoom: 0, // Minimum zoom level for clustering
      extent: 512, // Tile extent (used for calculating zoom levels)
      nodeSize: 64, // Size of the KD-tree leaf node
      log: false, // Enable logging for debugging (optional)
      map: (props) => {
        const isD = props["Crime Group"].includes("d");
        const isV = props["Crime Group"].includes("v");
        const isP = props["Crime Group"].includes("p");
        const isM = props["Crime Group"].includes("m");
        return {
          countD: isD ? 1 : 0,
          countV: isV ? 1 : 0,
          countP: isP ? 1 : 0,
          countM: isM ? 1 : 0,
        };
      },
      reduce: (accumulated, props) => {
        accumulated.countD += props.countD;
        accumulated.countV += props.countV;
        accumulated.countP += props.countP;
        accumulated.countM += props.countM;
        return accumulated;
      },
    });
    this.zoom = 0;
    this.bbox = [];
    this.isRerenderTrigger = false;
  }

  _loadData() {
    return new Promise((resolve, reject) => {
      if (this.map) {
        this.zoom = Math.floor(this.map.getZoom());
        this.bbox = [
          this.map.getBounds().getWest(),
          this.map.getBounds().getSouth(),
          this.map.getBounds().getEast(),
          this.map.getBounds().getNorth(),
        ];
      }
      resolve(this.superCluster.load(this.source));
      reject(new Error("cannot load cluster data from babylon cluster layer"));
    });
  }

  _initBabylonEngine(gl) {
    return new Promise((resolve, reject) => {
      this.engine = new BABYLON.Engine(
        gl,
        true,
        {
          useHighPrecisionMatrix: true,
        },
        true
      );
      resolve(this.engine);
      reject(new Error("cannot init engine from babylon cluster layer"));
    });
  }

  _render3D(engine) {}

  onAdd(map, gl) {
    this.map = map;
    // babylon
    this._loadData().then(
      this._initBabylonEngine(gl).then((engine) => {
        if (this.source != null || undefined) {
          createBabylonBars(engine, this.source).then((scene) => {
            this.scene = scene;
          });
        }
      })
    );
  }

  render(gl, matrix) {
    // this._scheduleMovingCheck();
    if (this.isRerenderTrigger) {
      createBabylonBars(this.engine, this.source).then((scene) => {
        this.scene = scene;
      });
      this.isRerenderTrigger = false;
    }

    if (this.scene) {
      // this.source = this.supercluster.getClusters(this.bbox, this.zoom);

      const cameraMatrix = BABYLON.Matrix.FromArray(matrix);
      this.scene.activeCamera.freezeProjectionMatrix(cameraMatrix);
      this.scene.render(false);
    }
    this.map.triggerRepaint();
  }

  rerender(bbox, zoom) {
    this.source = this.superCluster.getClusters(bbox, zoom);
    this.isRerenderTrigger = true;
    console.log(this.source);
  }
}

//old version
// const createBabylonLayer = (type, year) => {
//   let dataID = `${type}_${year}`;
//   let path = `./data/${dataID}.geojson`;
//   let sourceID = `source_${dataID}`;
//   let layerID = `babylon_${dataID}`;
//   console.log(path);
//   if (!existLayers.hasOwnProperty(layerID)) {
//     fetchData(path, sourceID, activeFilter).then((data) => {
//       map.on("load", () => {
//         let babylonLayer = new BabylonClusterLayer(layerID, data);
//         map.addLayer(babylonLayer);
//         existLayers[layerID] = babylonLayer;
//         activeLayerIDs.push(layerID);
//       });
//     });
//   }
//   handleMoveEnd();
// };

let existLayer = false;
const createBabylonLayer = () => {
  if (existLayer === true) {
    map.removeLayer("babylonLayer");
  }
  fetchData().then((data) => {
    let babylonLayer;
    map.on("load", () => {
      babylonLayer = new BabylonClusterLayer("babylonLayer", data);
      map.addLayer(babylonLayer);
      existLayer = true;
    });
    map.on("moveend", () => {
      const zoom = Math.floor(map.getZoom()); // Get the current zoom level from Mapbox GL map
      // console.log(zoom);
      const bounds = map.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ]; // Get the current bounding box from Mapbox GL map
      babylonLayer.rerender(bbox, zoom);
    });
  });
};

createBabylonLayer();
// createBabylonLayer("crime_d", 2019);
