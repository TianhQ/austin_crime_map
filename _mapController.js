import { map } from "./Map.js";
import { babylonLayer } from "./BabylonClusterLayer.js";
import { activeFilter } from "./Filter.js";
import { DualRangeSlider } from "./DualRangeSlider.js";

let crimeToggleButtons = document.querySelectorAll(".filter__button--cType");
let timeClassToggleButtons = document.querySelectorAll(
  ".filter__button--timeClass"
);
let yearSlider = new DualRangeSlider("Year");
let hourSlider = new DualRangeSlider("Hour");
var toggleButton = document.querySelector(".toggle-button");
toggleButton.addEventListener("click", () => {
  var menu = document.querySelector(".map__filter--menu");
  menu.classList.toggle("open");
});
// const resetBtn = document.querySelector(".filter__button--reset");

const selectedCrimes = [];
const selectedYears = [];

crimeToggleButtons.forEach((button) => {
  button.addEventListener("click", function () {
    if (button.classList.contains("active")) {
      button.classList.remove("active");
      let index = selectedCrimes.indexOf(button.getAttribute("data-value"));
      selectedCrimes.splice(
        index,
        1
      ); /* Set selectedValue to null when deselecting */
    } else {
      button.classList.add("active");
      selectedCrimes.push(button.getAttribute("data-value"));
    }
    activeFilter.setSelectedCrimes(selectedCrimes);
  });
});

let selectedTimeClass = [];
timeClassToggleButtons.forEach((button) => {
  button.addEventListener("click", function () {
    let value = button.getAttribute("data-value");
    if (button.classList.contains("active")) {
      button.classList.remove("active");
      if (value === "n") {
        // map.setStyle("mapbox://styles/mapbox/light-v10");
        map.addLayer(babylonLayer);
      }
      let index = selectedTimeClass.indexOf(value);
      selectedTimeClass.splice(index, 1);
      /* Set selectedValue to null when deselecting */
    } else {
      button.classList.add("active");

      if (value === "n") {
        // map.setStyle("mapbox://styles/mapbox/dark-v10");
        map.addLayer(babylonLayer);
      }
      selectedTimeClass.push(value);
    }
    console.log(selectedTimeClass);
    activeFilter.setSelectTimeClass(selectedTimeClass);
  });
});
