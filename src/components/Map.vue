<script setup>
// defineProps({
//   msg: {
//     type: String,
//     required: true
//   }
// })

import  L  from "leaflet";
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  

import { shallowRef, onMounted, onUnmounted, markRaw, ref } from 'vue'

const mapContainer = ref(null)
const map = ref(null)

const center = ref([-27.3313328, 133.0994293])


onMounted(() => {
  map.value = L.map("map").setView(center.value, 4);

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
  map.value.pm.disableDraw();


  // map.value.pm.enableDraw('Marker', {
  //   markerStyle: {
  //     color: 'red'
  //   }
  // });

  // map.value.pm.setPathOptions(
    
  // );

  // const initialState = { lng: 144.9631, lat: -37.8136, zoom: 10 }

  // map.value = markRaw(new Map({
  //   container: mapContainer.value,
  //   style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
  //   center: [initialState.lng, initialState.lat],
  //   zoom: initialState.zoom
  // }))

  // map.value.on('move', function () {
  //   centerLocation.value[0] = map.value.transform.center["lat"]
  //   centerLocation.value[1] = map.value.transform.center["lng"]
  // })

})

onUnmounted(() => {
  map.value?.remove();
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
