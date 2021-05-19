import React from 'react';
import {JSONSchema, MapFeature, OSMImageNote, WorkplaceEntrance} from "components/types";
import OSMImageNotesMap from "components/osm_image_notes/OSMImageNotesMap";
import {Location} from "util_components/types";
import sessionRequest from "sessionRequest";
import {osmImageNoteUrl, workplaceEntrancesUrl, workplaceEntranceUrl} from "urls";
import {osmFeatureLabel} from "util_components/osm/utils";
import {OSMFeature} from "util_components/osm/types";
// @ts-ignore
import Form from "@rjsf/bootstrap-4";

type WorkplaceEntranceEditorProps = {
  workplace: MapFeature,
  imageNote: OSMImageNote,
  workplaceEntrance: WorkplaceEntrance,
  onSubmit: () => any
}

type WorkplaceEntranceEditorState = {
  workplaceEntrance?: WorkplaceEntrance
}

const initialState: WorkplaceEntranceEditorState = {};

const schema: JSONSchema = {
  properties: {
    delivery_types: {
      "type": "string",
      "maxLength": 64,
      "title": "Delivery types"
    },
    delivery_hours: {
      "type": "string",
      "maxLength": 64,
      "title": "Delivery hours"
    },
    delivery_instructions: {
        "type": "string",
        "title": "Delivery instructions"
    }
  }
};

const uiSchema = {
  delivery_instructions: {"ui:widget": 'textarea'}
};

export default class WorkplaceEntranceEditor extends React.Component<WorkplaceEntranceEditorProps, WorkplaceEntranceEditorState> {
  state = initialState;

  render() {
    const {imageNote} = this.props;
    const {workplaceEntrance} = this.state;

    if (!workplaceEntrance) return false;

    const entranceNote = workplaceEntrance.image_note;
    const entrance = workplaceEntrance.entrance_data;

    const formData = {
      ...workplaceEntrance,
      delivery_types: (workplaceEntrance.delivery_types || []).join(', '),
    };

    return <div>
      {entranceNote ?
        <div className="p-2">
          {entranceNote.image &&
            <div className="text-center mb-2">
              <img src={entranceNote.image} style={{height: 120}}/>
            </div>
          }
          <div className="font-weight-bold mb-2">
            {entrance && osmFeatureLabel({tags: entrance.as_osm_tags} as OSMFeature)}
          </div>
          <Form schema={schema} uiSchema={uiSchema} className="compact"
                  formData={formData}
                  onSubmit={this.onSubmit}/>
        </div>
      :
        <>
          <div className="p-2">Select entrance to link:</div>
          <div style={{height: 400}}>
            <OSMImageNotesMap filters={{tags: ['Entrance']}} onNoteSelected={this.onNoteSelected}
                              location={imageNote as Location} zoom={20}/>
          </div>
        </>
      }
    </div>;
  }

  componentDidMount() {
    const {workplaceEntrance} = this.props;
    if (workplaceEntrance) this.setState({workplaceEntrance})
  }

  onNoteSelected = (note: OSMImageNote) => {
    sessionRequest(osmImageNoteUrl(note.id as number))
      .then(response => response.json())
      .then(entranceNote => {
        const {workplace} = this.props;
        const entrance = entranceNote.entrance_set[0];
        if (!entrance) return;
        const workplaceEntrance: WorkplaceEntrance = {
          workplace: workplace.id, entrance: entrance.id,
          entrance_data: entrance, image_note: entranceNote,
          delivery_hours: '', delivery_instructions: '', delivery_types: []
        };
        this.setState({workplaceEntrance});
      });
  };

  onSubmit = ({formData}: any) => {
    const {workplaceEntrance} = this.state;
    const {onSubmit} = this.props;
    if (!workplaceEntrance) return;

    let request;

    formData.delivery_types = formData.delivery_types.split(/, ?/);

    if (workplaceEntrance.id) {
      const url = workplaceEntranceUrl(workplaceEntrance.id);
      request = sessionRequest(url, {method: 'PATCH', data: formData});
    } else {
      const url = workplaceEntrancesUrl;
      const data = Object.assign(workplaceEntrance, formData);
      request = sessionRequest(url, {method: 'POST', data});
    }

    request.then(response => {
      if (response.status < 300) {
        onSubmit();
      }
    })
  }
}
