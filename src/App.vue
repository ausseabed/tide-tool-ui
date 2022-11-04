<script setup>
import Map from './components/Map.vue'

</script>

<template>
  <a-row type="flex" :gutter="[0,0]">
    <a-col flex="400px">
      <a-row>
        <img src="/banner.svg" style="width: 100%; height: 100%;">
      </a-row>
      <img src="/Logo.png" style="background-color: red;">

      <a-row class="title-box">
        <a-col>
          <a-typography-title class="title-text">Tide Tool UI</a-typography-title>
          <a-typography-text type="secondary">Create zone definition files (zdf) used to define tide zones and stations for the Teledyne CARIS marine mapping software.</a-typography-text>
        </a-col>
      </a-row>
      
    </a-col>
    <a-col flex="auto">
      <div style="width: 100%; height: 100%;">
        <Map ></Map>
      </div>
    </a-col>
  </a-row>



</template>

<style scoped>
.title-box {
  margin: 0px 16px 0px 16px;
}

.title-text {
  margin-bottom: -4px;
}
</style>
