import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "react-bootstrap/Modal";
import apiClient from "../services/apiClient";

function ModalComp({
  isOpen,
  onClose,
  children,
  confirmAction,
  confirmLabel = "Yes",
  cancelLabel = "No",
  queryKey,
  apiEndPoint,
  deleteRow,
  showActions = true,
  postEndPoint,
  onSuccessAction,
  className,
  dialogClassName,
}) {
  const queryClient = useQueryClient();
  const method = postEndPoint ? "post" : "delete";
  const endPoint =
    method === "post" ? postEndPoint : `${apiEndPoint}/${deleteRow?.id}`;
  const mutation = useMutation({
    mutationFn: () => apiClient[method](`${endPoint}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      onClose();
      if (onSuccessAction) onSuccessAction();
    },
    onError: (err) => {
      console.error("Error:", err);
    },
  });

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
      onClose();
    }
    // if (deleteRow)
    else {
      mutation.mutate();
      onClose();
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      className={className}
      dialogClassName={dialogClassName}
    >
      <Modal.Body className="darkcard-modal">{children}</Modal.Body>
      {showActions && (
        <div className="d-flex justify-content-center gap-5 py-4  darkcard-modal">
          <div>
            <button className="cancel-btn " onClick={onClose}>
              {cancelLabel}
            </button>
          </div>
          <div>
            <button
              className={
                confirmLabel === "Approve"
                  ? "btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center mx-2 approve-btn"
                  : "logout-btn"
              }
              onClick={handleConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ModalComp;
