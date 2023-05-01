import { babylonLayer } from "./BabylonClusterLayer.js";
import { activeFilter } from "./Filter.js";
import { map } from "./Map.js";
const path = `./data/all_detail_all.geojson`;

export class DataLoader {
  constructor() {
    this.superCluster = new Supercluster({
      radius: 50, // Clustering radius in pixels
      maxZoom: 20, // Maximum zoom level for clustering
      minZoom: 8, // Minimum zoom level for clustering
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

    this.data = this._fetchData();
  }

  _fetchData = () => {
    return new Promise((resolve, reject) => {
      fetch(path)
        .then((response) => response.json())
        .then((data) => {
          this.data = data.features;
        })

        .then(() => this.applyFilters())
        .then((filtered) => {
          this.filteredData = filtered;
          resolve(this.data);
        })
        .catch((err) => {
          reject(new Error(`Err-cannot fetch data - ${path}`));
        });
    });
  };

  applyFilters = () => {
    return new Promise((resolve, reject) => {
      if (
        Array.isArray(activeFilter.activeFilters) &&
        activeFilter.activeFilters.length === 0
      ) {
        this.filteredData = this.data;
        this._updateCluster();
        resolve(this.filteredData);
      }
      const finalFilter = activeFilter.activeFilters.reduce(
        (prevFilter, currentFilter) => {
          return (item) => prevFilter(item) && currentFilter(item);
        }
      );
      this.filteredData = this.data.filter(finalFilter);
      this._updateCluster();

      resolve(this.filteredData);
    });
  };

  _updateCluster = () => {
    return new Promise((resolve, reject) => {
      if (map) {
        let zoom = Math.floor(map.getZoom());
        let bbox = [
          map.getBounds().getWest(),
          map.getBounds().getSouth(),
          map.getBounds().getEast(),
          map.getBounds().getNorth(),
        ];
        this.superCluster.load(this.filteredData);
        this.filteredData = this.superCluster.getClusters(bbox, zoom);
        resolve(this.filteredData);
      }
    });
  };
}

export const dataLoader = new DataLoader();

export const getFilteredData = () => {
  return new Promise((ressolve, reject) => {
    ressolve(dataLoader.data);
  });
};
