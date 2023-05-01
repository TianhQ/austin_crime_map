mapboxgl.accessToken =
  "pk.eyJ1IjoidG9ueXFpdSIsImEiOiJjbGc3N2ExMTQwMzZ4M25ubGxzaDZzMHoxIn0.m_AzCz1OpgTu6v_4sN0Esw";

const austin_coord = [-97.7333, 30.2667]; //lng, lat

export const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  zoom: 10,
  center: austin_coord,
  pitch: 60,
  antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
});
