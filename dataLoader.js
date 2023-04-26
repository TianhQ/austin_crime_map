const path = `./data/all_detail_all.geojson`;
let activeFilters = [
  (feature) => feature.properties.TimeClass === "n",
  (feature) => feature.properties.Year === 2019,
  (feature) =>
    feature.properties["Crime Group"] === "p" ||
    feature.properties["Crime Group"] === "v",
];

export const setActiveFilters = (filters) => {
  activeFilters = filters;
};

export const fetchData = () => {
  return new Promise((resolve, reject) => {
    fetch(path)
      .then((response) => response.json())
      .then((data) => processData(data, activeFilters))
      .then((filteredData) => resolve(filteredData))
      .catch((err) => {
        reject(new Error(`Err-cannot fetch data - ${path}`));
      });
  });
};

const processData = (data, filter) => {
  return new Promise((resolve, reject) => {
    const finalFilter = filter.reduce((prevFilter, currentFilter) => {
      return (item) => prevFilter(item) && currentFilter(item);
    });
    const filteredData = data.features.filter(finalFilter);
    resolve(filteredData);
  });
};
