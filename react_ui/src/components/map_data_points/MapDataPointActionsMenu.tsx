import React from "react";
import Icon from "util_components/bootstrap/Icon";
import { MapDataPoint } from "components/types";
import MapDataPointReviewActions from "components/map_data_points/MapDataPointReviewActions";
import sessionRequest from "sessionRequest";
import { mapDataPointUrl } from "urls";
import { WithTranslation, withTranslation } from "react-i18next";

interface MapDataPointActionsMenuProps extends WithTranslation {
  note: MapDataPoint;
  showOnMap?: () => any;
  adjustPosition?: () => any;
  closeNote: () => any;
  canEdit: boolean;
  refreshNote: () => any;
}

type MapDataPointActionsMenuState = {
  show: boolean;
};

const initialState: MapDataPointActionsMenuState = {
  show: false,
};

class MapDataPointActionsMenu extends React.Component<
  MapDataPointActionsMenuProps,
  MapDataPointActionsMenuState
> {
  state = initialState;

  render() {
    const { note, adjustPosition, closeNote, canEdit, t } = this.props;
    const { lon, lat } = note;

    const { show } = this.state;
    const showCls = show ? " show" : "";

    const googleUrl = `https://maps.google.com/?layer=c&cbll=${note?.lat},${note.lon}`;
    const mapillaryUrl = `https://www.mapillary.com/app/?lat=${note?.lat}&lng=${note.lon}&z=20&panos=true`;
    const osmUrl = `https://www.openstreetmap.org/edit#map=20/${lat}/${lon}`;

    return (
      <div className={"dropdown d-inline-block" + showCls}>
        <button
          className="btn btn-light p-1"
          onClick={() => this.setState({ show: !show })}
        >
          <Icon icon="menu"></Icon>
        </button>
        <div className={"dropdown-menu" + showCls}>
          <button className="dropdown-item" onClick={this.copyPermalink}>
            <Icon icon="link" /> {t("Copy link to this note")}
          </button>
          {adjustPosition && (
            <button className="dropdown-item" onClick={adjustPosition}>
              <Icon icon="open_with" /> {t("Move note")}
            </button>
          )}

          <input
            name="image"
            id="map_data_point_image"
            className="d-none"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={this.onImageCaptured}
          />

          {canEdit && (
            <button className="dropdown-item" onClick={this.onImageClick}>
              <Icon icon="camera_alt" />{" "}
              {note.image ? "Update picture" : "Add picture"}
            </button>
          )}

          <h6 className="dropdown-header">{t("Show position in")}:</h6>
          <a className="dropdown-item" target="google-maps" href={googleUrl}>
            Google Street View
          </a>
          <a className="dropdown-item" target="mapillary" href={mapillaryUrl}>
            Mapillary
          </a>
          <a className="dropdown-item" target="_osm_editor" href={osmUrl}>
            OpenStreetMap
          </a>

          <MapDataPointReviewActions
            mapDataPoint={note}
            onProcessed={closeNote}
          />
        </div>
        <textarea
          id="permalink"
          value={window.location.href}
          style={{ width: 0, height: 0, opacity: 0 }}
          readOnly
        />
      </div>
    );
  }

  copyPermalink = () => {
    (document.getElementById("permalink") as HTMLInputElement).select();
    document.execCommand("copy");
  };

  private imageEl() {
    return document.getElementById("map_data_point_image") as HTMLInputElement;
  }

  onImageClick = () => {
    this.imageEl().click();
  };

  onImageCaptured = () => {
    const { note, refreshNote } = this.props;
    const files = this.imageEl().files as FileList;
    const image = files[0];
    let formData = new FormData();
    formData.append("image", image);
    sessionRequest(mapDataPointUrl(note.id as number), {
      method: "PATCH",
      body: formData,
    }).then((response: any) => {
      if (response.status < 300) {
        refreshNote();
        this.setState({ show: false });
      }
    });
  };
}

export default withTranslation()(MapDataPointActionsMenu);
