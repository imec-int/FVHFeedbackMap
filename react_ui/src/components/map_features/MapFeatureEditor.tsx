import React from 'react';
import _ from 'lodash';
// @ts-ignore
import Form from "react-jsonschema-form";

import {AppContext, JSONSchema, MapFeature, OSMImageNote, WorkplaceEntrance} from "components/types";
// @ts-ignore
import {Button} from "reactstrap";
import {OSMFeature} from "util_components/osm/types";
import ConfirmButton from "util_components/bootstrap/ConfirmButton";
import {userCanEditNote} from "components/osm_image_notes/utils";
import WorkplaceTypeWidget from "components/map_features/WorkplaceTypeWidget";
import WorkplaceEntrances from "components/map_features/WorkplaceEntrances";
import UnloadingPlaceEntrances from "components/map_features/UnloadingPlaceEntrances";
import UnloadingPlaceAccessPoints from "components/map_features/UnloadingPlaceAccessPoints";
import {osmFeatureLabel} from "util_components/osm/utils";
import {getDistance} from "geolib";
import {GeolibInputCoordinates} from "geolib/es/types";

type MapFeatureEditorProps = {
  schema: JSONSchema,
  onSubmit: (data: any) => any,
  onDelete?: () => any,
  featureTypeName: string,
  osmImageNote: OSMImageNote,
  nearbyFeatures: OSMFeature[],
  refreshNote?: () => any,
  mapFeature: MapFeature,
  osmFeature?: OSMFeature
}

type MapFeatureEditorState = {
  editing: boolean
}

const initialState: MapFeatureEditorState = {
  editing: false
};

type AnyObject = {[key: string]: any};

const customWidgets: AnyObject = {
  Workplace: {type: WorkplaceTypeWidget}
};

const omitFields: AnyObject = {
  UnloadingPlace: ['entrances'],
  Workplace: ['workplace_entrances']
};

export default class MapFeatureEditor extends React.Component<MapFeatureEditorProps, MapFeatureEditorState> {
  state: MapFeatureEditorState = initialState;

  static contextType = AppContext;

  static defaultProps = {
    osmImageNote: {},
    nearbyFeatures: []
  };

  componentDidMount() {
    if (!this.props.mapFeature.id) this.setState({editing: true});
  }

  render() {
    const {schema, featureTypeName, osmImageNote, refreshNote, mapFeature, osmFeature} = this.props;
    const {user} = this.context;
    const editable = userCanEditNote(user, osmImageNote);
    const {editing} = this.state;

    const filteredSchema = {...schema};
    // Don't show OSM Feature as a silly integer input field in the form:
    const {osm_feature, ...filteredProps} = schema.properties;
    filteredSchema.properties = omitFields[featureTypeName] ? Object.fromEntries(
      Object.entries(filteredProps).filter(([k, v]) => !omitFields[featureTypeName].includes(k))
    ) : filteredProps;

    const discrepantTags = osmFeature && mapFeature.as_osm_tags &&
      // @ts-ignore
      Object.keys(mapFeature.as_osm_tags).filter(k => osmFeature.tags[k] && osmFeature.tags[k] != mapFeature.as_osm_tags[k]);

    return <div>
      <p className="mt-2">
        <strong>{featureTypeName}</strong>
        {!editing &&
          <>
            {' '}
            {editable &&
              <Button size="sm" color="primary" outline className="btn-compact"
                      onClick={() => this.setState({editing: true})}>Edit</Button>
            }
            {' '}
            {mapFeature.as_osm_tags &&
              <Button size="sm" color="secondary" outline className="btn-compact"
                      onClick={() => this.copyText(mapFeature.id + '-osm-text')}>Copy</Button>
            }
            {editable &&
              <ConfirmButton onClick={() => this.onDelete()}
                             className="btn-outline-danger btn-compact btn-sm float-right"
                             confirm={`Really delete ${featureTypeName}?`}>Delete</ConfirmButton>
            }
          </>
        }
      </p>

      {editing ?
        <Form schema={filteredSchema} uiSchema={this.getUISchema()} className="compact"
              formData={mapFeature}
              onSubmit={this.onSubmit}>
          <Button size="sm" color="primary" type="submit" className="btn-compact pl-4 pr-4 mr-2">Save</Button>
          <Button tag="span" size="sm" color="secondary" outline className="btn-compact pl-4 pr-4"
                  onClick={this.onCancel}>Cancel</Button>
          <ConfirmButton onClick={() => this.onDelete()}
                         className="btn-outline-danger btn-compact btn-sm float-right"
                         confirm={`Really delete ${featureTypeName}?`}>Delete</ConfirmButton>
        </Form>
        :
        <>
          {mapFeature.as_osm_tags &&
          <textarea id={mapFeature.id + '-osm-text'}
                    rows={Object.keys(mapFeature.as_osm_tags).length}
                    className="form-control"
                    readOnly
                    value={Object.entries(mapFeature.as_osm_tags).map(([k, v]) => `${k}=${v}`).join('\n')}/>
          }

          {osmFeature && <table className="table table-bordered table-sm mt-2 mb-2">
            <tr><th colSpan={3}>
              OSM: <a href={`https://www.openstreetmap.org/${osmFeature.type}/${osmFeature.id}`} target="osm">
                {osmFeatureLabel(osmFeature)}
              </a>
              {osmFeature.type == 'node' &&
                <> ({getDistance(osmFeature, osmImageNote as GeolibInputCoordinates)}m)</>
              }
            </th></tr>
            {discrepantTags && discrepantTags.length > 0 && <>
              <tr><th></th><th>OLMap</th><th>OSM</th></tr>
              {discrepantTags.map(tag =>
                // @ts-ignore
                <tr key={tag}><th>{tag}</th><td>{mapFeature.as_osm_tags[tag]}</td><td>{osmFeature.tags[tag]}</td></tr>
              )}
            </>}
          </table>}

        </>
      }

      {featureTypeName == 'Workplace' && editable && !editing &&
        <WorkplaceEntrances workplace={mapFeature} osmImageNote={osmImageNote} refreshNote={refreshNote}
                            schema={schema.properties.workplace_entrances.items}/>
      }
      {featureTypeName == 'UnloadingPlace' && editable && !editing && mapFeature.id &&
        <div className="mb-4 mt-1">
          <UnloadingPlaceEntrances unloadingPlace={mapFeature} osmImageNote={osmImageNote}/>
          <UnloadingPlaceAccessPoints unloadingPlace={mapFeature} osmImageNote={osmImageNote}/>
        </div>
      }
    </div>
  }

  private onCancel = () => {
    const {osmImageNote, mapFeature, onDelete} = this.props;
    const fieldName = this.getFeatureListFieldName();
    // @ts-ignore
    const featureList = osmImageNote[fieldName];
    // @ts-ignore
    this.setState({editing: false});
    if (!mapFeature.id) {
      featureList.splice(featureList.indexOf(mapFeature, 1));
      onDelete && onDelete();
    }
  };

  onDelete = () => {
    const {osmImageNote, onSubmit, onDelete, mapFeature} = this.props;
    const fieldName = this.getFeatureListFieldName();
    // @ts-ignore
    const featureList = osmImageNote[fieldName];
    // @ts-ignore
    featureList.splice(featureList.indexOf(mapFeature), 1);
    // @ts-ignore
    Promise.resolve(onSubmit({[fieldName]: featureList}))
    .then(() => {
      this.setState({editing: false});
      onDelete && onDelete();
    });
  };

  private copyText(osmTextId: string) {
    (document.getElementById(osmTextId) as HTMLInputElement).select();
    document.execCommand('copy');
  }

  private getFeatureListFieldName() {
    return `${this.props.featureTypeName.toLowerCase()}_set`;
  }

  onSubmit = (data: any) => {
    const {onSubmit, osmImageNote, mapFeature, featureTypeName} = this.props;
    const fieldName = this.getFeatureListFieldName();

    Object.assign(mapFeature, data.formData);
    this.linkOSMFeature();

    // @ts-ignore
    const mapFeatures = osmImageNote[fieldName]
      .map((feature: MapFeature) => _.omit(feature, ...(omitFields[featureTypeName] || [])));

    Promise.resolve(onSubmit({[fieldName]: mapFeatures, osm_features: osmImageNote.osm_features}))
      .then(() => this.setState({editing: false}));
  };

  linkOSMFeature() {
    const {osmImageNote, mapFeature, featureTypeName, nearbyFeatures} = this.props;
    if (!mapFeature.osm_feature) {
      if (featureTypeName == "Workplace" && mapFeature.name) {
        const osmFeature = nearbyFeatures.find(
          f => f.tags.name && f.tags.name.search(new RegExp(mapFeature.name, 'i')) > -1);
        if (osmFeature) {
          const osmId = Number(osmFeature.id);
          if (!osmImageNote.osm_features.includes(osmId)) osmImageNote.osm_features.push(osmId);
          mapFeature.osm_feature = osmId;
        }
      }
    }
  }

  private getUISchema() {
    const {schema, featureTypeName} = this.props;
    const radioFields = Object.entries(schema.properties)
      .filter(([field, spec]) =>
        // @ts-ignore
        String(spec.type) == String(["boolean", "null"]))
      .map(([field, spec]) => {
        // @ts-ignore
        return [field, {"ui:widget": "radio"}]
      });
    const customWidgetsForSchema = customWidgets[featureTypeName] || {};
    const customFields = Object.entries(schema.properties)
      .filter(([field, spec]) => customWidgetsForSchema[field])
      .map(([field, spec]) => {
        return [field, {"ui:widget": customWidgetsForSchema[field]}]
      });
    const textFields = Object.entries(schema.properties)
        // @ts-ignore
      .filter(([field, spec]) => spec.type == 'string' && !spec.maxLength && !spec.enum)
      .map(([field, spec]) => {
        return [field, {"ui:widget": 'textarea'}]
      });
    return Object.fromEntries(radioFields.concat(customFields).concat(textFields));
  }
}
