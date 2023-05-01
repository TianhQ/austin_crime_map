import { activeFilter } from "./Filter.js";

export class DualRangeSlider {
  constructor(sliderName) {
    this.selectedValue = [];
    this.sliderName = sliderName;
    this.fromSlider = document.querySelector(`#${sliderName}__fromSlider`);
    this.toSlider = document.querySelector(`#${sliderName}__toSlider`);
    this.fromInput = document.querySelector(`#${sliderName}__fromInput`);
    this.toInput = document.querySelector(`#${sliderName}__toInput`);
    this._fillSlider(
      this.fromSlider,
      this.toSlider,
      "#C6C6C6",
      "#0066b2",
      this.toSlider
    );
    this._setToggleAccessible(this.toSlider);

    this.fromSlider.oninput = () => {
      this._controlFromSlider(this.fromSlider, this.toSlider, this.fromInput);
      // this._updateFilter();
    };

    this.toSlider.oninput = () => {
      this._controlToSlider(this.fromSlider, this.toSlider, this.toInput);
      // this._updateFilter();
    };
    this.fromInput.oninput = () => {
      this._controlFromInput(
        this.fromSlider,
        this.fromInput,
        this.toInput,
        this.toSlider
      );
      // this._updateFilter();
    };
    this.toInput.oninput = () => {
      this._controlToInput(
        this.toSlider,
        this.fromInput,
        this.toInput,
        this.toSlider
      );
      // this._updateFilter();
    };
  }

  setInputValue(to, from) {
    this.fromInput.value = from;
    this.toInput.value = to;
    this._controlFromInput(
      this.fromSlider,
      this.fromInput,
      this.toInput,
      this.toSlider
    );
    this._controlToInput(
      this.toSlider,
      this.fromInput,
      this.toInput,
      this.toSlider
    );
  }
  //code from https://medium.com/@predragdavidovic10/native-dual-range-slider-html-css-javascript-91e778134816
  _controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
    const [from, to] = this._getParsed(fromInput, toInput);
    this._fillSlider(fromInput, toInput, "#C6C6C6", "#0066b2", controlSlider);
    if (from > to) {
      fromSlider.value = to;
      fromInput.value = to;
    } else {
      fromSlider.value = from;
    }
  }

  _controlToInput(toSlider, fromInput, toInput, controlSlider) {
    const [from, to] = this._getParsed(fromInput, toInput);
    this._fillSlider(fromInput, toInput, "#C6C6C6", "#0066b2", controlSlider);
    this._setToggleAccessible(toInput);
    if (from <= to) {
      toSlider.value = to;
      toInput.value = to;
    } else {
      toInput.value = from;
    }
  }

  _controlFromSlider(fromSlider, toSlider, fromInput) {
    const [from, to] = this._getParsed(fromSlider, toSlider);
    this._fillSlider(fromSlider, toSlider, "#C6C6C6", "#0066b2", toSlider);
    if (from > to) {
      fromSlider.value = to;
      fromInput.value = to;
    } else {
      fromInput.value = from;
    }
  }

  _controlToSlider(fromSlider, toSlider, toInput) {
    const [from, to] = this._getParsed(fromSlider, toSlider);
    this._fillSlider(fromSlider, toSlider, "#C6C6C6", "#0066b2", toSlider);
    this._setToggleAccessible(toSlider);
    if (from <= to) {
      toSlider.value = to;
      toInput.value = to;
    } else {
      toInput.value = from;
      toSlider.value = from;
    }
  }

  _getParsed(currentFrom, currentTo) {
    const from = parseInt(currentFrom.value, 10);
    const to = parseInt(currentTo.value, 10);
    this._updateFilter(from, to);
    return [from, to];
  }

  _fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max - to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
    controlSlider.style.zIndex = 0;
  }

  _setToggleAccessible(currentTarget) {
    const toSlider = document.querySelector(`#${this.sliderName}__toSlider`);
    if (Number(currentTarget.value) <= 0) {
      toSlider.style.zIndex = 2;
    } else {
      toSlider.style.zIndex = 1;
    }
  }

  _updateFilter(from, to) {
    this.selectedValue = [];
    for (let i = from; i < to; i++) {
      this.selectedValue.push(i);
    }
    if (this.sliderName === "Year") {
      activeFilter.setSelectedYears(this.selectedValue);
    } else if (this.sliderName === "Hour") {
      activeFilter.setSelectedHours(this.selectedValue);
    }
  }
}
