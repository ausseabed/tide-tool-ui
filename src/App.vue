<script setup>
import Map from './components/Map.vue'

import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from 'vue';
import { Zdf } from './zdf'

const fileList = ref([]);
const tideMap = ref();

onMounted(() => {

});

const handleChange = info => {

  if (info.file.status !== 'uploading') {
    tideMap.value?.setTracklinesFile(info);
  }

  if (info.file.status === 'done') {
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};

const upload = async (file) => {
  // dummy upload function as we don't upload the file
  return true
};

const uploadFiles = ( {onSuccess, onError, file} ) => {
  upload(file)
    .then(() => {
      onSuccess(null, file);
    })
    .catch(() => {
      console.log('error');
    });
};

const downloadZdf = () => {

  let zdf = new Zdf()

  let tideZones = tideMap.value?.getTideZones()
  zdf.setZonesWithGeojson(tideZones)

  let tideStations = tideMap.value?.getTideStations()
  zdf.setStationsWithGeojson(tideStations)

  zdf.buildTideZones()

  let al = zdf.allLines()
  console.log(al)
};


</script>

<template>
  <a-row type="flex" :gutter="[0,0]">
    <a-col flex="400px">
      <a-row>
        <img src="/banner.svg" style="width: 100%; height: 100%;">
      </a-row>
      <img src="/Logo.png">

      <a-row class="title-box">
        <a-col>
          <a-typography-title class="title-text">Tide Tool UI</a-typography-title>
          <a-typography-text type="secondary">Create zone definition files (zdf) used to define tide zones and stations for the Teledyne CARIS marine mapping software.</a-typography-text>
        </a-col>
      </a-row>

      <a-row class="title-box">
        <div>
          <a-divider orientation="left">Tracklines</a-divider>
          <p>
            Open a tracklines file. This will display the tracklines as a readonly map layer to support creating tide zones and stations.
          </p>
          <a-upload
            v-model:file-list="fileList"
            name="file"
            :customRequest="uploadFiles"
            @change="handleChange">
            <a-button>
              <upload-outlined></upload-outlined>
              Click to Upload
            </a-button>
          </a-upload>
        </div>
      </a-row>

      <a-row class="title-box">
        <div>
          <a-divider orientation="left">Zone Definition File</a-divider>
          <p>
            Create tide zones and tide stations using the map drawing tools. Once complete click the button below to download a zone definition file (*.zdf).
          </p>
          <a-button block @click="downloadZdf">Download ZDF</a-button>
        </div>
      </a-row>
      
    </a-col>
    <a-col flex="auto">
      <div style="width: 100%; height: 100%;">
        <Map ref="tideMap"></Map>
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

<style>
div.ant-upload {
  width: 100%;
}

div.ant-upload > span > button {
  width: 100%;
}
</style>