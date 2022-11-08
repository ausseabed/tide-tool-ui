<script setup>

import  L  from "leaflet";

import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  

import { shallowRef, onMounted, onUnmounted, markRaw, ref } from 'vue'

import { readFileAsync, tracklinesToCoords, simplifyCoords } from "../util";

L.PM.setOptIn(true);

const mapContainer = ref(null)
const map = ref(null)

const center = ref([-27.3313328, 133.0994293])

onMounted(() => {

  let DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: icon2x,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  L.Marker.prototype.options.icon = DefaultIcon;


  map.value = L.map("map", { pmIgnore: false }).setView(center.value, 4);

  L.tileLayer(
    "https://services.ga.gov.au/gis/rest/services/NationalBaseMap/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        '© Geoscience Australia - <a target="_blank" href="https://services.ga.gov.au/gis/rest/services/NationalBaseMap/MapServer">details<a>',
    }
  ).addTo(map.value)

  map.value.pm.addControls({
    position: 'topleft',
    drawCircle: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawText: false,
    cutPolygon: false,
    rotateMode: false,
    dragMode: false
  })

  map.value.on('pm:create', (e) => {
    e.layer.options.pmIgnore = false
    L.PM.reInitLayer(e.layer)
  })

  map.value.pm.setPathOptions(
    { color: 'red'}
  )

  map.value.pm.enableDraw('Poly', {
    hintlineStyle: {
      color: 'red',
      dashArray: [5, 5],
    },
    templineStyle: {
      color: 'red',
    }
  });
  map.value.pm.disableDraw()

  map.value.pm.enableDraw('Marker', {
    markerStyle: {
      icon: DefaultIcon
    },
    snappable: false
  });
  map.value.pm.disableDraw()
})

onUnmounted(() => {
  map.value?.remove();
})


const setTracklinesFile = async (info) => {
  try {
    let content = await readFileAsync(info)
    let trackline = tracklinesToCoords(content)
    let simpleTrackline = simplifyCoords(trackline)

    // console.log(trackline)
    // console.log(simpleTrackline)
    let coords = simpleTrackline.map((coord) => {
      return [coord.x, coord.y]
    })

    let polylineOptions = {
      color: 'yellow',
      interactive: false,
      pmIgnore: true
    }
    let polyline = L.polyline(coords, polylineOptions).addTo(map.value)
    map.value.fitBounds(polyline.getBounds())
    
  } catch (err) {
    console.log(err)
  }
}


const getTideZones = () => {
  var fg = L.featureGroup();
  map.value?.eachLayer((layer) => {
    if (layer instanceof L.Path && layer.pm) {
      fg.addLayer(layer);
    }
  });
  // console.log(fg.toGeoJSON());
  return fg.toGeoJSON()
}

const getTideStations = () => {
  var fg = L.featureGroup();
  map.value?.eachLayer((layer) => {
    if (layer instanceof L.Marker && layer.pm) {
      fg.addLayer(layer);
    }
  });
  // console.log(fg.toGeoJSON());
  return fg.toGeoJSON()
}


defineExpose({
  setTracklinesFile,
  getTideZones,
  getTideStations 
})
</script>

<template>
  <div class="map-container" ref="mapContainer" id="map"></div>
</template>

<style>
@import '../../node_modules/leaflet/dist/leaflet.css';
</style>

<style scoped>

.map-container {
  width: 100%;
  height: 100%;
}

</style>
