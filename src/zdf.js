/*
Representation of the zone definition file in object form
*/

class ZdfBlock {

  constructor(type) {
    this.type = type
  }

  toStrings() {
    throw new Error('Method "toStrings()" must be implemented.')
  }
}


class ZdfBlockHeader extends ZdfBlock {

  constructor() {
    super('ZONE_DEF_VERSION_3')
  }

  toStrings() {
    return [`[${this.type}]`]
  }
}

/**
 * [OPTIONS]
 * Outage, 600
 * Interval, 10
 */
class ZdfBlockOptions extends ZdfBlock {

  constructor() {
    super('OPTIONS')
    this.outage = 600
    this.interval = 10
  }

  toStrings() {
    return [
      `[${this.type}]`,
      `Outage, ${this.outage}`,
      `Interval, ${this.interval}`
    ]
  }
}


class ZdfBlockZone extends ZdfBlock {

  constructor(name, number, coords) {
    super('ZONE')
    this.name = name
    this.number = number
    this.coords = coords
  }

  toStrings() {
    let coordsStr = this.coords.map((coord) => {
      return `${coord[0]}, ${coord[1]}`
    })
    return [
      `[${this.type}]`,
      `${this.name},${this.number}`,
      ...coordsStr
    ]
  }

  static fromGeojson(geojson, name) {
    // assume a simple polygon (no holes) and just grab the first coordinate
    // list
    let coords = geojson.geometry.coordinates[0]
    let zone = new ZdfBlockZone(name, coords.length, coords)
    return zone
  }
}


/**
 * Stores the details of the individual tide stations listed in a TIDE_STATION
 * block
 */
class TideStationDetails {
  constructor(name, latitude, longitude, filename) {
    this.name = name
    this.latitude = latitude
    this.longitude = longitude
    this.filename = filename

    // some unknown params that end up in the TIDE_STATION block
    this.p1 = 0.0
    this.p2 = 0.01
  }

  toString() {
    return `${this.name},${this.latitude.toPrecision(9)},${this.longitude.toPrecision(9)},${this.p1},${this.p2},${this.filename}`
  }
}


class ZdfBlockStation extends ZdfBlock {

  constructor() {
    super('TIDE_STATION')
    this.stationDetails = []
  }

  addStationDetails(sd) {
    this.stationDetails.push(sd)
  }
  
  toStrings() {
    let stationsStr = this.stationDetails.map((sd) => {
      return sd.toString()
    })
    return [
      `[${this.type}]`,
      ...stationsStr
    ]
  }

  static fromGeojson(geojson) {
    // accepts a featureGroup, each point (tide station) is a feature
    let stationBlock = new ZdfBlockStation()
    
    for (const feature of geojson.features) {
      let numStr = `${stationBlock.stationDetails.length + 1}`.padStart(3, '0')
      let name = `tidestation${numStr}`
      let filename = `${name}.tid`
      let latitude = feature.geometry.coordinates[1]
      let longitude = feature.geometry.coordinates[0]

      let sd = new TideStationDetails(name, latitude, longitude, filename)
      stationBlock.addStationDetails(sd)
    }
    return stationBlock
  }
}





class Zdf {
  constructor() {
    this.headers = []
    this.zones = []
    this.stations = []
    this.footers = []
    
    this.headers.push(new ZdfBlockHeader())
    this.footers.push(new ZdfBlockOptions())
  }

  setZonesWithGeojson(geojsonZones) {
    for (const feature of geojsonZones.features) {
      let numStr = `${this.zones.length + 1}`.padStart(3, '0')
      let name = `zone${numStr}`
      let zone = ZdfBlockZone.fromGeojson(feature, name)
      this.zones.push(zone)
    }
  }


  setStationsWithGeojson(geojsonStations) {
    let station = ZdfBlockStation.fromGeojson(geojsonStations)
    this.stations.push(station)
  }


  allBlocks() {
    let ab = [
      ...this.headers,
      ...this.zones,
      ...this.stations,
      ...this.footers
    ]
    return ab
  }

  allLines() {
    let ab = this.allBlocks()
    let al = []
    ab.forEach((block) => {
      al.push(...block.toStrings())
      al.push('')
    })
    return al
  }

}

export { Zdf }