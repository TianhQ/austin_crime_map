import { map } from "./Map.js";

export const createBabylonBars = (engine, data) => {
  return new Promise((resolve, reject) => {
    let scene = initScene(engine).then((scene) => {
      initMaterials(scene).then((materials) => {
        _initObjs(scene, data, materials).then(() => {
          resolve(scene);
        });
      });
    });
  });
};

const initScene = (engine) => {
  return new Promise((resolve, reject) => {
    let scene = new BABYLON.Scene(engine);
    scene.autoClear = false;
    scene.detachControl();
    scene.beforeRender = function () {
      engine.wipeCaches(true);
    };
    scene.ambientColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    let camera = new BABYLON.Camera(
      "mapbox-camera",
      new BABYLON.Vector3(),
      scene
    );
    let light = new BABYLON.HemisphericLight(
      "mapbox-light",
      new BABYLON.Vector3(0.5, 0.5, 4000),
      scene
    );
    resolve(scene);
  });
};

const initMaterials = (scene) => {
  return new Promise((resolve, reject) => {
    let vcMaterial = new BABYLON.StandardMaterial("vcMaterial", scene);
    vcMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.482, 0.329); // violence crime diffuse color
    let pcMaterial = new BABYLON.StandardMaterial("pcMaterial", scene);
    pcMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.698, 0.41961); // property crime diffuse color
    let dcMaterial = new BABYLON.StandardMaterial("dcMaterial", scene);
    dcMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.83529, 0.43529); // drug crime diffuse color
    let mcMaterial = new BABYLON.StandardMaterial("mcMaterial", scene);
    mcMaterial.diffuseColor = new BABYLON.Color3(0.57647, 0.60784, 0.38431); // misdemeanor diffuse color
    let gMaterial = new BABYLON.StandardMaterial("gMaterial", scene);
    gMaterial.diffuseColor = new BABYLON.Color3(0.3373, 0.3373, 0.3373); // general diffuse color

    const materials = {
      vc: vcMaterial,
      pc: pcMaterial,
      dc: dcMaterial,
      mc: mcMaterial,
      g: gMaterial,
    };
    resolve(materials);
  });
};

const _useMaterial = (type, subType, materials) => {
  if ((type = "crime")) {
    if (subType === "v") {
      return materials.vc;
    } else if (subType === "p") {
      return materials.pc;
    } else if (subType === "d") {
      return materials.dc;
    } else if (subType === "m") {
      return materials.mc;
    }
  }
  return materials.g;
};

const heightFactors = [1, 2, 3, 6, 10, 20];
const areaFactors = [2000, 1000, 300, 200, 150, 80];

const _createBar = (scene, material, position, count) => {
  let currZoom = map.getZoom() >= 10 ? Math.floor(map.getZoom() - 10) : 0;
  currZoom = currZoom > 5 ? 5 : currZoom;

  const modelAltitude = 0;
  const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat(
    position,
    modelAltitude
  );
  const modelScale = modelCoords.meterInMercatorCoordinateUnits();
  let areaFactor = areaFactors[currZoom];
  let heightFactor = heightFactors[currZoom];
  let cylinder = BABYLON.MeshBuilder.CreateCylinder(
    "cylinder",
    {
      diameterTop: areaFactor * modelScale,
      diameterBottom: areaFactor * modelScale,
      height: heightFactor * count * modelScale,
      tessellation: 6,
    },
    scene
  );
  cylinder.material = material;
  material.alpha = 1.0;
  cylinder.position = new BABYLON.Vector3(
    modelCoords.x,
    modelCoords.y,
    modelCoords.z + (heightFactor / 2) * count * modelScale
    //height offset
  );
  cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
    new BABYLON.Vector3.Left(),
    Math.PI / 2
  ); // rotate the cylinder 90 degrees around the X-axis
};

const _createClusterBar = (
  scene,
  position,
  materials,
  vCount,
  pCount,
  dCount,
  mCount
) => {
  let currZoom = map.getZoom() >= 10 ? Math.floor(map.getZoom() - 10) : 0;
  currZoom = currZoom > 5 ? 5 : currZoom;
  const modelAltitude = 0;
  const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat(
    position,
    modelAltitude
  );
  const modelScale = modelCoords.meterInMercatorCoordinateUnits();
  let areaFactor = areaFactors[currZoom];
  let heightFactor = heightFactors[currZoom];
  let barArea = areaFactor * modelScale;

  let mSegHeight = heightFactor * mCount * modelScale;

  // let segArr = [];
  if (mSegHeight !== 0) {
    let mSeg = _createBarSegement(
      scene,
      modelCoords,
      materials.mc,
      barArea,
      mSegHeight,
      0
    );
    // segArr.push(mSeg);
  }

  let dSegHeight = heightFactor * dCount * modelScale;
  if (dSegHeight !== 0) {
    let dSeg = _createBarSegement(
      scene,
      modelCoords,
      materials.dc,
      barArea,
      dSegHeight,
      mSegHeight
    );
    // segArr.push(dSeg);
  }
  let pSegHeight = heightFactor * pCount * modelScale;
  if (pSegHeight !== 0) {
    let pSeg = _createBarSegement(
      scene,
      modelCoords,
      materials.pc,
      barArea,
      pSegHeight,
      mSegHeight + dSegHeight
    );
    // segArr.push(pSeg);
  }
  let vSegHeight = heightFactor * vCount * modelScale;
  if (vSegHeight !== 0) {
    let vSeg = _createBarSegement(
      scene,
      modelCoords,
      materials.vc,
      barArea,
      vSegHeight,
      mSegHeight + dSegHeight + pSegHeight
    );
    // segArr.push(vSeg);
  }
};

const _createBarSegement = (
  scene,
  modelCoords,
  material,
  segArea,
  segHeight,
  heightOffset
) => {
  let selfHeightOffset = segHeight / 2;
  let cylinder = BABYLON.MeshBuilder.CreateCylinder(
    "cylinder",
    {
      diameterTop: segArea,
      diameterBottom: segArea,
      height: segHeight,
      tessellation: 6,
    },
    scene
  );
  cylinder.material = material;
  cylinder.position = new BABYLON.Vector3(
    modelCoords.x,
    modelCoords.y,
    modelCoords.z + selfHeightOffset + heightOffset
  );
  cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
    new BABYLON.Vector3.Left(),
    Math.PI / 2
  );
  return cylinder;
};

const _initObjs = (scene, data, materials) => {
  return new Promise((resolve, reject) => {
    if (data.length != 0) {
      data.forEach((feature) => {
        const position = feature.geometry.coordinates;
        if (feature.properties["cluster"] === true) {
          _createClusterBar(
            scene,
            position,
            materials,
            feature.properties["countV"],
            feature.properties["countP"],
            feature.properties["countD"],
            feature.properties["countM"]
          );
        } else {
          const count = feature.properties["Count"];
          const crimeType = feature.properties["Crime Group"];
          const material = _useMaterial("crime", crimeType, materials);
          _createBar(scene, material, position, count);
        }
      });
    }
    resolve(scene);
  });
};
