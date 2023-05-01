// import { setActiveFilter } from "./dataloader.js";
import { dataLoader } from "./dataloader.js";
import { babylonLayer } from "./BabylonClusterLayer.js";
class Filter {
  constructor() {
    this.selectedCrimes = [];
    this.selectedHours = [];
    this.selectedYears = [];
    this.selectedTimeClass = [];
    this.activeFilters = [
      // (feature) =>
      //   feature.properties.TimeClass === "n" ||
      //   feature.properties.TimeClass === "d",
      // (feature) => feature.properties.Year === 2019,
      // (feature) =>
      //   feature.properties["Crime Group"] === "p" ||
      //   feature.properties["Crime Group"] === "v",
    ];
  }
  _updateFilter() {
    this.activeFilters = [];
    this._createFilterFunctions("Crime Group", this.selectedCrimes) !== null &&
      this.activeFilters.push(
        this._createFilterFunctions("Crime Group", this.selectedCrimes)
      );

    this._createFilterFunctions("Year", this.selectedYears) !== null &&
      this.activeFilters.push(
        this._createFilterFunctions("Year", this.selectedYears)
      );

    this._createFilterFunctions("Hour", this.selectedHours) !== null &&
      this.activeFilters.push(
        this._createFilterFunctions("Hour", this.selectedHours)
      );

    this._createFilterFunctions("TimeClass", this.selectTimeClass) !== null &&
      this.activeFilters.push(
        this._createFilterFunctions("TimeClass", this.selectTimeClass)
      );
    dataLoader.applyFilters();
    babylonLayer.rerender();
    // console.log(this.activeFilters);
  }
  addSelectedCrime(crime) {
    this.selectedCrimes.push(crime);
  }

  setSelectedCrimes(selectedCrimes) {
    this.selectedCrimes = selectedCrimes;
    console.log(this.selectedCrimes);
    this._updateFilter();
  }
  setSelectedYears(selectedYears) {
    this.selectedYears = selectedYears;
    this._updateFilter();
  }

  setSelectedHours(selectedHours) {
    this.selectedHours = selectedHours;
    this._updateFilter();
  }
  setSelectTimeClass(selectTimeClass) {
    this.selectTimeClass = selectTimeClass;
    this._updateFilter();
  }

  _nonLastFilter(column, value) {
    if (typeof value === "string") {
      return `feature.properties["${column}"] === "${value}" || `;
    } else if (Number.isInteger(value)) {
      return `feature.properties["${column}"] === ${value} || `;
    }
  }
  _lastFilter(column, value) {
    if (typeof value === "string") {
      return `feature.properties["${column}"] === "${value}"`;
    } else if (Number.isInteger(value)) {
      return `feature.properties["${column}"] === ${value}`;
    }
  }

  _createFilterFunctions(groupName, content) {
    if (Array.isArray(content) && content.length !== 0) {
      let resFilter = "(feature) =>";
      for (let i = 0; i < content.length - 1; i++) {
        resFilter = resFilter + this._nonLastFilter(groupName, content[i]);
      }
      resFilter =
        resFilter + this._lastFilter(groupName, content[content.length - 1]);
      return Function(`'use strict'; return ${resFilter}`)();
    }
    return null;
  }
}
export const activeFilter = new Filter();
// let activeFilters = [
//   // (feature) => feature.properties.TimeClass === "n",
//   (feature) => feature.properties.Year === 2019,
//   // (feature) =>
//   //   feature.properties["Crime Group"] === "p" ||
//   //   feature.properties["Crime Group"] === "v",
// ];
