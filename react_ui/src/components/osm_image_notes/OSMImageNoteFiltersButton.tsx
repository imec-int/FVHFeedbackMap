import React from 'react';
// @ts-ignore
import _ from 'lodash';
// @ts-ignore
import {ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {AppContext, MapFeatureTypes} from "components/types";
import MapToolButton from "components/osm_image_notes/MapToolButton";


type OSMImageNoteFiltersButtonProps = {
  mapFeatureTypes?: MapFeatureTypes,
  onFiltersChanged: (filters: any) => any
}

type OSMImageNoteFiltersButtonState = {
  filters: any,
  filtersOpen: boolean
}

const initialState: () => OSMImageNoteFiltersButtonState = () => ({
  filters: {},
  filtersOpen: false
});

export default class OSMImageNoteFiltersButton extends React.Component<OSMImageNoteFiltersButtonProps, OSMImageNoteFiltersButtonState> {
  state: OSMImageNoteFiltersButtonState = initialState();
  static contextType = AppContext;

  render() {
    const {filters, filtersOpen} = this.state;
    const {mapFeatureTypes} = this.props;
    const nonStatusFilters = _.omit(filters, ['is_processed', 'is_reviewed', 'is_accepted']);
    const {user} = this.context;

    return <ButtonDropdown isOpen={filtersOpen} toggle={() => this.setState({filtersOpen: !filtersOpen})}>
      <DropdownToggle tag="span">
        <MapToolButton icon="filter_alt"/>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Filter</DropdownItem>
        <DropdownItem className={(filters.created_by) ? 'text-primary' : ''}
                      onClick={() => this.toggleFilter({created_by: user.id})}>
          My notes
        </DropdownItem>
        <DropdownItem divider/>
        <DropdownItem className={(filters.is_accepted === false) ? 'text-primary' : ''}
                      onClick={() => this.setFilters(
                        (filters.is_processed === false) ? nonStatusFilters
                        : _.assign({}, nonStatusFilters, {is_processed: false, is_reviewed: false, is_accepted: false}))}>
          New
        </DropdownItem>
        <DropdownItem className={filters.is_accepted ? 'text-primary' : ''}
                      onClick={() => this.setFilters(
                        filters.is_accepted ? nonStatusFilters
                        : _.assign({}, nonStatusFilters, {is_processed: false, is_reviewed: false, is_accepted: true}))}>
          Ready for OSM
        </DropdownItem>
        <DropdownItem className={(filters.is_processed) ? 'text-primary' : ''}
                      onClick={() => this.setFilters(
                        (filters.is_processed) ? nonStatusFilters
                        : _.assign({}, nonStatusFilters, {is_processed: true, is_reviewed: false}))}>
          In OSM
        </DropdownItem>
        <DropdownItem className={(filters.is_reviewed) ? 'text-primary' : ''}
                      onClick={() => this.setFilters(
                        (filters.is_reviewed) ? nonStatusFilters
                        : _.assign({}, nonStatusFilters, {is_reviewed: true}))}>
          Reviewed
        </DropdownItem>
        <DropdownItem divider/>
        {mapFeatureTypes && Object.keys(mapFeatureTypes).map((tag) =>
          <DropdownItem key={tag}
                        className={(filters.tags && filters.tags.includes(tag)) ? 'text-primary' : ''}
                        onClick={() => this.toggleFilter({tags: tag})}>
            {tag}
          </DropdownItem>
        )}
      </DropdownMenu>
    </ButtonDropdown>
  }

  private toggleFilter(filter: any) {
    const filters = Object.assign({}, this.state.filters);

    Object.entries(filter).forEach(([key, value]) => {
      if (key == 'tags') {
        if (filters.tags && filters.tags.includes(value)) {
          filters.tags = _.without(filters.tags, value);
          if (!filters.tags.length) delete filters.tags;
        }
        else filters.tags = (filters.tags || []).concat([value]);
      }
      else if ((filters[key] == value) || (value === undefined)) delete filters[key];
      else filters[key] = value;
    });
    this.setFilters(filters);
  }

  setFilters(filters: any) {
    this.setState({filters});
    this.props.onFiltersChanged(filters);
  }
}
