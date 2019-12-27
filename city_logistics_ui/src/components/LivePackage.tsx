import React from 'react';
import LiveDataLoader from "util_components/LiveDataLoader";
import PendingOutgoingPackage from "components/package_cards/PendingOutgoingPackage";
import Spinner from "util_components/Spinner";
import NavBar from "util_components/NavBar";
import {Package} from "components/types";

export default class LivePackage extends React.Component<{uuid: string}> {
  url(uuid: string) {
    return `/rest/packages/${uuid}/`
  }

  state: {pkg?: Package} = {
    pkg: undefined
  };

  render() {
    const {uuid} = this.props;
    const {pkg} = this.state;

    return <>
      <NavBar icon="work" iconText="" header="Package"/>
      <div className="container">
        <LiveDataLoader url={this.url(uuid)} onLoad={(pkg) => this.setState({pkg})}/>
        {pkg ? <PendingOutgoingPackage package={pkg}/> : <Spinner/>}
      </div>
    </>;
  }
}