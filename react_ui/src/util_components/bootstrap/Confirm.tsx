import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

// @ts-ignore
import { Input } from "reactstrap";

import Modal, { ModalActions } from "util_components/bootstrap/Modal";

interface ConfirmProps extends WithTranslation {
  title: string;
  inputPlaceholder?: string;
  onConfirm: (confirmText?: string) => any;
  onClose: () => any;
}

class Confirm extends React.Component<ConfirmProps> {
  render() {
    const { title, onConfirm, onClose, inputPlaceholder, t } = this.props;

    return (
      <Modal title={title} onClose={onClose}>
        {inputPlaceholder && (
          <Input
            type="textarea"
            name="confirm"
            id="confirmText"
            placeholder={inputPlaceholder}
          />
        )}
        <ModalActions
          actions={[
            { label: t("Cancel"), color: "light", action: onClose },
            {
              label: t("OK"),
              color: "secondary",
              action: () => this.onConfirm(),
            },
          ]}
        />
      </Modal>
    );
  }

  private onConfirm() {
    const { onConfirm, onClose } = this.props;
    const input = document.getElementById("confirmText") as HTMLInputElement;
    const value = input && input.value;
    onClose();
    onConfirm(value);
  }
}

export default withTranslation()(Confirm);
