import React from "react";

import { Button, ButtonGroup } from "reactstrap";
import { AppContext, MapDataPoint, User } from "components/types";
import Icon from "util_components/bootstrap/Icon";
import sessionRequest from "sessionRequest";
import { downvoteMapDataPointUrl, upvoteMapDataPointUrl } from "urls";
import { WithTranslation, withTranslation } from "react-i18next";

interface MapDataPointVotesProps extends WithTranslation {
  mapDataPoint: MapDataPoint;
  currentUser: User;
  onUpdate: (note: MapDataPoint) => any;
}

class MapDataPointVotes extends React.Component<MapDataPointVotesProps> {
  static contextType = AppContext;

  buttonProps = {
    outline: true,
    size: "sm",
    className: "btn-compact",
  };

  render() {
    const { mapDataPoint, t } = this.props;
    const upvoteUrl = upvoteMapDataPointUrl(mapDataPoint.id as number);
    const downvoteUrl = downvoteMapDataPointUrl(mapDataPoint.id as number);

    const userUpvoted = mapDataPoint.upvotes?.includes(
      this.props.currentUser.id
    );

    const userDownvoted = mapDataPoint.downvotes?.includes(
      this.props.currentUser.id
    );

    console.log(this.props.currentUser.id, mapDataPoint.upvotes, userUpvoted);
    console.log(
      this.props.currentUser.id,
      mapDataPoint.downvotes,
      userDownvoted
    );

    return (
      <ButtonGroup className="btn-block">
        <Button
          {...this.buttonProps}
          color="success"
          onClick={() => this.updateNote(upvoteUrl)}
        >
          <Icon icon="thumb_up" /> {t("Useful")} (
          {mapDataPoint.upvotes ? mapDataPoint.upvotes.length : 0})
          {userUpvoted && <Icon icon="check" />}
        </Button>
        <Button
          {...this.buttonProps}
          color="danger"
          onClick={() => this.updateNote(downvoteUrl)}
        >
          <Icon icon="thumb_down" /> {t("Not useful")} (
          {mapDataPoint.downvotes ? mapDataPoint.downvotes.length : 0})
          {userDownvoted && <Icon icon="check" />}
        </Button>
      </ButtonGroup>
    );
  }

  updateNote = (url: string) => {
    const { onUpdate } = this.props;

    sessionRequest(url, { method: "PUT" }).then((response) => {
      if (response.status < 400)
        response.json().then((note: MapDataPoint) => onUpdate(note));
    });
  };
}

export default withTranslation()(MapDataPointVotes);
