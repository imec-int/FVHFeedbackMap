import React from "react";
import * as L from "leaflet";
import "mapbox-gl-leaflet";
import settings from "settings.json";

import "leaflet/dist/leaflet.css";
import { LocationTuple } from "util_components/types";
import Icon from "util_components/bootstrap/Icon";

type MapProps = {
  onMapInitialized?: (leafletMap: any) => any;
  latLng: LocationTuple;
  zoom: number;
  extraLayers?: any[];
  showAttribution: boolean;
  zoomControl: boolean;
  onClick?: (latLng: LocationTuple) => any;
  backgroundChangeable: boolean;
};

let idCounter = 0;

type bgType = "orthophoto" | "osm";
type MapState = {
  background: bgType;
};

const initialState: MapState = {
  background: "osm",
};

export default class Map extends React.Component<MapProps, MapState> {
  private leafletMap: any = null;
  private bgLayer: any = null;
  private id = idCounter++;

  state = { ...initialState };

  static defaultProps = {
    zoom: 18,
    latLng: settings.defaultLocation,
    showAttribution: true,
    zoomControl: true,
    backgroundChangeable: false,
  };

  initMapState() {
    this.leafletMap = null;
  }

  render() {
    const { backgroundChangeable } = this.props;
    return (
      <>
        <div id={this.getMapElId()} style={{ height: "100%" }}>
          {" "}
        </div>
        {backgroundChangeable && (
          <div
            style={{
              height: 64,
              marginTop: -64,
              position: "relative",
              zIndex: 400,
            }}
          >
            <button
              className="btn btn-outline-primary ml-2 btn-sm bg-white"
              onClick={this.switchBackground}
            >
              <Icon icon="layers" />
            </button>
          </div>
        )}
      </>
    );
  }

  private getMapElId() {
    return "leafletMap" + this.id;
  }

  componentDidMount() {
    this.refreshMap();
  }

  componentWillUnmount() {
    if (this.leafletMap) this.leafletMap.remove();
    this.initMapState();
  }

  componentDidUpdate(prevProps?: Readonly<MapProps>) {
    if (prevProps && prevProps.extraLayers)
      prevProps.extraLayers.forEach((layer) => {
        if (!this.props.extraLayers?.includes(layer)) layer.remove();
      });
    this.refreshMap();
  }

  refreshMap() {
    const {
      latLng,
      zoom,
      extraLayers,
      onMapInitialized,
      showAttribution,
      zoomControl,
      onClick,
    } = this.props;
    const newMap = !this.leafletMap;

    if (!this.leafletMap) {
      this.leafletMap = L.map(this.getMapElId(), {
        attributionControl: showAttribution,
        zoomControl: zoomControl,
        preferCanvas: true,
      });
      this.leafletMap.setView(latLng, zoom);
      this.initBgLayer(this.state.background);

      if (onClick) {
        this.leafletMap.on("click", (e: any) => {
          onClick([e.latlng.lat, e.latlng.lng]);
        });
      }

      if (onMapInitialized) onMapInitialized(this.leafletMap);
    }
    if (extraLayers)
      extraLayers.forEach((mapLayer) => {
        if (!this.leafletMap.hasLayer(mapLayer)) {
          mapLayer.addTo(this.leafletMap);
          if (!newMap && mapLayer.getBounds)
            this.leafletMap.fitBounds(mapLayer.getBounds());
        }
      });
  }

  initBgLayer(background: bgType) {
    // const {showAttribution} = this.props;
    // const attribution = 'Data &copy; <a href="https://www.openstreetmap.org/">OSM</a> contribs, ' +
    //   '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';

    if (this.bgLayer) this.bgLayer.remove();

    if (background === "osm") {
      this.bgLayer = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(this.leafletMap);
    } else {
      this.bgLayer = L.tileLayer
        .wms("https://kartta.hsy.fi/geoserver/ows?", {
          layers: "taustakartat_ja_aluejaot:Ortoilmakuva_2019",
          maxZoom: 19,
        })
        .addTo(this.leafletMap);
    }
  }

  switchBackground = () => {
    const background = { orthophoto: "osm", osm: "orthophoto" }[
      this.state.background
    ] as bgType;
    this.setState({ background });
    this.initBgLayer(background);
  };
}
