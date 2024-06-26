import React from "react";

import sessionRequest from "sessionRequest";
import { mapDataPointUrl } from "urls";
import { AppContext, CreatedBy, MapDataPoint } from "components/types";
import Modal from "util_components/bootstrap/Modal";
import ErrorAlert from "util_components/bootstrap/ErrorAlert";

import "components/map_data_points/MapDataPoints.css";

import { LocationTuple, Location } from "util_components/types";
import MapDataPointTags from "components/map_data_points/MapDataPointTags";
import ZoomableImage from "util_components/ZoomableImage";
import MapDataPointComments from "components/map_data_points/MapDataPointComments";
import { formatTimestamp } from "utils";
import { userCanEditNote } from "./utils";
import MapToolButton from "components/map_data_points/MapToolButton";
import MapDataPointActionsMenu from "components/map_data_points/MapDataPointActionsMenu";
import MapDataPointsMap from "components/map_data_points/MapDataPointsMap";
import { WithTranslation, withTranslation } from "react-i18next";
import MapDataPointVotes from "./MapDataPointVotes";
import settings from "../../settings.json";

interface MapDataPointModalProps extends WithTranslation {
  note: MapDataPoint;
  onClose: () => any;
  showOnMap?: () => any;
  requestLocation?: (fn: (l: Location) => any, initial: any) => any;
  cancelLocationRequest?: () => any;
  fullScreen?: boolean;
}

type MapDataPointModalState = {
  note?: MapDataPoint;
  error: boolean;
  repositioning: boolean;
};

const initialState: MapDataPointModalState = {
  error: false,
  repositioning: false,
};

class MapDataPointModal extends React.Component<
  MapDataPointModalProps,
  MapDataPointModalState
> {
  static contextType = AppContext;
  state: MapDataPointModalState = initialState;

  componentDidMount() {
    this.fetchNote();
  }

  componentDidUpdate(prevProps: Readonly<MapDataPointModalProps>) {
    if (prevProps && prevProps.note.id != this.props.note.id) this.fetchNote();
  }

  render() {
    const { onClose, fullScreen, showOnMap, requestLocation, t, i18n } =
      this.props;
    const { note, repositioning } = this.state;
    const { user } = this.context as any;

    if (!note) return null;

    if (repositioning)
      return (
        <div className="mt-4 text-right">
          {t("Scroll map to select position")}{" "}
          <MapToolButton onClick={this.cancelLocationRequest}>
            {t("Cancel")}
          </MapToolButton>
        </div>
      );

    const canEdit = userCanEditNote(user, note);
    const adjustPosition =
      canEdit && requestLocation ? this.adjustPosition : undefined;

    const credit = `${
      note.created_by && (note.created_by as CreatedBy).username
        ? (note.created_by as CreatedBy).username
        : user?.username || ""
    } ${formatTimestamp(note.created_at)}`;

    const tag = (note.tags || ["New"])[0];
    const title = (
      <>
        <MapDataPointActionsMenu
          {...{
            showOnMap,
            note,
            adjustPosition,
            canEdit,
            closeNote: onClose,
          }}
          refreshNote={this.fetchNote}
        />
        {note.comment || i18n.exists(`tags.${tag}`) ? t(`tags.${tag}`) : tag}
        {note.created_by ? t(" by ") : " "}
        {credit}
      </>
    );

    const modalCls = note.image ? "modal-xl" : "modal-dialog-centered";
    return fullScreen ? (
      <>
        <h6 className="pt-2">{title}</h6>
        {this.renderContent()}
      </>
    ) : (
      <Modal
        title={title}
        className={modalCls}
        onClose={onClose}
        headerCls="pl-0 pt-2 pr-2 pb-2"
      >
        {this.renderContent()}
      </Modal>
    );
  }

  renderContent() {
    const { note, error, repositioning } = this.state;
    const { user } = this.context as any;
    const { t } = this.props;

    if (repositioning || !note) return null;

    const canEdit = userCanEditNote(user, note);
    const readOnly = !canEdit;
    const location = [note.lon, note.lat] as LocationTuple;
    const tags = note.tags || [];

    return (
      <>
        <ErrorAlert
          status={error}
          message={t("Saving features failed. Try again perhaps?")}
        />
        {note.image ? (
          <ZoomableImage src={note.image} className="noteImage" />
        ) : (
          <div style={{ height: "40vh" }}>
            <MapDataPointsMap
              useUrl={false}
              selectLocation={
                !canEdit
                  ? undefined
                  : (location: Location) => this.updateSelectedNote(location)
              }
              location={note as Location}
              zoom={18}
              mapDataPoints={[note]}
            />
          </div>
        )}

        <MapDataPointTags
          {...{ tags, readOnly }}
          onChange={(tags) => this.updateSelectedNote({ tags })}
        />

        {settings.enableVotes && user != undefined && (
          <MapDataPointVotes
            mapDataPoint={note}
            currentUser={user}
            onUpdate={(note) => this.setState({ note })}
          />
        )}

        <MapDataPointComments
          mapDataPoint={note}
          refreshNote={this.fetchNote}
        />
      </>
    );
  }

  updateSelectedNote(data: any, nextState?: any) {
    const { note } = this.state;
    if (!note) return;
    const url = mapDataPointUrl(note.id as number);

    sessionRequest(url, { method: "PATCH", data }).then((response) => {
      if (response.status < 300)
        response.json().then((note: MapDataPoint) => {
          this.setState({ note, error: false });
        });
      else this.setState({ error: true });
    });
  }

  fetchNote = () => {
    return sessionRequest(mapDataPointUrl(this.props.note.id as number))
      .then((response) => response.json())
      .then((note) => this.setState({ note }));
  };

  adjustPosition = () => {
    const { requestLocation, note } = this.props;
    if (!requestLocation) return;
    this.setState({ repositioning: true });

    const onLocationSelected = (location: any) => {
      this.updateSelectedNote(location);
      this.setState({ repositioning: false });
    };
    requestLocation(onLocationSelected, note);
  };

  cancelLocationRequest = () => {
    const { cancelLocationRequest } = this.props;
    cancelLocationRequest && cancelLocationRequest();
    this.setState({ repositioning: false });
  };
}

export default withTranslation()(MapDataPointModal);
