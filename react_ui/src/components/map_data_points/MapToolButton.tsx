import React from "react";
import Icon from "util_components/bootstrap/Icon";

interface MapToolButtonProps extends React.HTMLProps<HTMLButtonElement> {
  icon?: string;
  onClick?: () => any;
}

type MapToolButtonState = {};

const initialState: MapToolButtonState = {};

class MapToolButton extends React.Component<
  MapToolButtonProps,
  MapToolButtonState
> {
  state = initialState;

  render() {
    const { onClick, icon, children } = this.props as any;
    return (
      <button
        className="btn btn-outline-primary btn-sm bg-white mr-2"
        onClick={onClick}
      >
        {icon && <Icon icon={icon} />}
        {icon && children && " "}
        {children}
      </button>
    );
  }
}

export default MapToolButton;
