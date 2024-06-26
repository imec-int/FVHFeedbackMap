import React from "react";

export class ModalBody extends React.Component {
  render() {
    return <div className="modal-body">{(this.props as any).children}</div>;
  }
}

type Action = {
  label: string;
  action: () => any;
  color:
    | "primary"
    | "secondary"
    | "light"
    | "outline-primary"
    | "outline-secondary";
};

export class ModalActions extends React.Component<{ actions: Action[] }> {
  render() {
    return (
      <div className="modal-footer">
        {this.props.actions.map(({ label, action, color }) => (
          <button
            key={label}
            type="button"
            className={"btn btn-" + color}
            onClick={action}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }
}

type ModalProps = {
  title?: any;
  onClose: () => any;
  children?: any;
  className: string;
  headerContent?: any;
  headerCls: string;
};

export default class Modal extends React.Component<ModalProps> {
  static defaultProps = { className: "", headerCls: "" };

  escFunction = (event: any) => {
    if (event.keyCode === 27) this.props.onClose();
  };

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  render() {
    const { title, onClose, children, className, headerContent, headerCls } =
      this.props;

    return (
      <>
        <div className="modal-backdrop show"> </div>
        <div
          className="modal show"
          tabIndex={-1}
          role="dialog"
          onClick={onClose}
        >
          <div
            className={`modal-dialog ${className}`}
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              {(title || headerContent) && (
                <div className={"modal-header " + headerCls}>
                  {title && <h6 className="modal-title">{title}</h6>}
                  {headerContent}
                  {onClose && (
                    <button
                      type="button"
                      className="close"
                      aria-label="Close"
                      onClick={onClose}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  )}
                </div>
              )}
              <div
                style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
