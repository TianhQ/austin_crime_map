import { createBabylonBars } from "./BabylonRender.js";
import { map } from "./Map.js";
import { dataLoader } from "./dataloader.js";

export class BabylonClusterLayer {
  constructor(id) {
    this.id = id;
    this.type = "custom";
    this.renderingMode = "3d";

    this.isRerenderTrigger = false;
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
  _render3D() {
    createBabylonBars(this.engine, dataLoader.filteredData).then((scene) => {
      this.scene = scene;
    });
  }
  onAdd(map, gl) {
    this.map = map;
    // babylon;
    this._initBabylonEngine(gl).then(() => {
      this._render3D();
    });
  }

  render(gl, matrix) {
    if (this.isRerenderTrigger) {
      this._render3D();
      this.isRerenderTrigger = false;
    }

    if (this.scene) {
      const cameraMatrix = BABYLON.Matrix.FromArray(matrix);
      this.scene.activeCamera.freezeProjectionMatrix(cameraMatrix);
      this.scene.render(false);
    }
    this.map.triggerRepaint();
  }

  rerender() {
    this.isRerenderTrigger = true;
  }
}

export const babylonLayer = new BabylonClusterLayer("babylonLayer");
map.on("load", () => {
  map.addLayer(babylonLayer);
});
map.on("moveend", () => {
  dataLoader.applyFilters();
  babylonLayer.rerender();
});
