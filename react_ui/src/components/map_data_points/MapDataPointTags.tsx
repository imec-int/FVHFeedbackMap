import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import PillsSelection from "util_components/PillsSelection";
import Icon from "util_components/bootstrap/Icon";

interface MapDataPointTagsProps extends WithTranslation {
  tags: string[];
  onChange: (tags: string[]) => any;
  readOnly?: boolean;
  expanded?: boolean;
}

type MapDataPointTagsState = {
  editing: boolean;
};

const initialState: MapDataPointTagsState = {
  editing: false,
};

class MapDataPointTags extends React.Component<MapDataPointTagsProps> {
  state = initialState;

  render() {
    const { tags, readOnly, expanded, t } = this.props;
    const { editing } = this.state;
    const tagOptions = tags;
    return (
      <div className="list-group-item">
        <strong>{t("Tags")}: </strong>
        {readOnly ? (
          tags.length > 0 ? (
            <PillsSelection options={tags} selected={tags} />
          ) : (
            t("No tags selected")
          )
        ) : (
          <>
            {!expanded && (
              <button
                className="btn btn-light btn-sm rounded-pill float-right"
                onClick={() => this.setState({ editing: !editing })}
              >
                <Icon icon={editing ? "close" : "edit"} />
              </button>
            )}
            <PillsSelection
              options={tagOptions}
              selected={tags}
              onClick={this.toggleTag}
            />
          </>
        )}
      </div>
    );
  }

  componentDidMount() {
    if (this.props.expanded) this.setState({ editing: true });
  }

  toggleTag = (tag: string) => {
    const { editing } = this.state;

    if (!editing) return this.setState({ editing: true });

    const { tags, onChange } = this.props;
    const newTags = tags.slice();
    if (tags.includes(tag)) newTags.splice(tags.indexOf(tag), 1);
    else newTags.push(tag);
    onChange(newTags);
  };
}

export default withTranslation()(MapDataPointTags);
