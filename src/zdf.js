/*
Representation of the zone definition file in object form
*/

import { point, polygon } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';


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



/**
 * Stores the details of the individual tide stations listed in a TIDE_ZONE
 * block
 * eg;
 * box01,tide01,PRIM,600,1.0,1.08,0.01
 */
class TideZoneDetails {
  constructor(zone, stationDetails) {
    this.zone = zone
    this.stationDetails = stationDetails

    // some unknown params that end up in the TIDE_ZONE block
    this.p1 = 'PRIM'
    this.p2 = 600
    this.p3 = 1.0
    this.p4 = 1.08
    this.p5 = 0.01
  }

  toString() {
    return `${this.zone.name},${this.stationDetails.name},${this.p1},${this.p2},${this.p3},${this.p4},${this.p5}`
  }
}


class ZdfBlockTideZone extends ZdfBlock {

  constructor() {
    super('TIDE_ZONE')
    this.tideZoneDetails = []
  }

  addTideZoneDetails(tzd) {
    this.tideZoneDetails.push(tzd)
  }

  toStrings() {
    let tideZonesStr = this.tideZoneDetails.map((tzd) => {
      return tzd.toString()
    })
    return [
      `[${this.type}]`,
      ...tideZonesStr
    ]
  }

}



class Zdf {
  constructor() {
    this.headers = []
    this.zones = []
    this.tideZones = []
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

  /**
   * Builds the TIDE_ZONES block based on the ZONES and TIDE_STATIONS
   * that have already been added to this zdf. Is does this by checking
   * which tide stations fall within which tide zones.
   */
  buildTideZones() {
    let tideZone = new ZdfBlockTideZone()

    for (const zone of this.zones) {
      let zonePolygon = polygon([zone.coords])
      for (const station of this.stations) {
        for (const stationDetails of station.stationDetails) {
          let stationPoint = point([stationDetails.longitude, stationDetails.latitude])
          if (booleanPointInPolygon(stationPoint, zonePolygon)) {
            let tideZoneDetails = new TideZoneDetails(zone, stationDetails)
            tideZone.addTideZoneDetails(tideZoneDetails)
          }
        }
      }
    }

    this.tideZones.push(tideZone)
  }

  allBlocks() {
    let ab = [
      ...this.headers,
      ...this.zones,
      ...this.tideZones,
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