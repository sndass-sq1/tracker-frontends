import React, { useRef, useState, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { MdContactSupport } from "react-icons/md";
import apiClient from "../../services/apiClient";
import { UserContext } from "../../UserContext/UserContext";

const HelpSupportModal = () => {
  const [show, setShow] = useState(false);
  const fileInputRef = useRef(null);
  const { theme } = useContext(UserContext);
  const isDark = theme === "dark";

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const validationSchema = Yup.object({
    subject: Yup.string().required("Subject is required"),
    support_query: Yup.string().required("Support query is required"),
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const response = await apiClient.post("/help-support", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      formik.resetForm();
      if (fileInputRef.current) fileInputRef.current.value = "";
      handleClose();
    },
    onError: (error) => {
      console.error("Submission failed", error);
    },
  });

  const formik = useFormik({
    initialValues: {
      subject: "",
      support_query: "",
      attachments: [],
    },
    validationSchema,
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("subject", values.subject);
      formData.append("support_query", values.support_query);
      values.attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });
      mutation.mutate(formData);
    },
  });

  return (
    <>
      <button
        onClick={handleShow}
        style={{
          borderRadius: "15px",
          // padding: "3px",
          width: "43px",
          height: "36px",
          cursor: "pointer",
        }}
        title="Support"
        className="darknavcard1"
      >
        <MdContactSupport size={25} />
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        className={isDark ? "dark-modal" : ""}
      >
        <Modal.Header
          closeButton
          closeVariant={isDark ? "white" : "black"}
          className={isDark ? "bg-dark text-light" : ""}
        >
          <Modal.Title>Support Request</Modal.Title>
        </Modal.Header>

        <Modal.Body className={isDark ? "bg-dark text-light" : ""}>
          <form onSubmit={formik.handleSubmit}>
            <label className="fw-bold">Subject:</label>
            <input
              type="text"
              name="subject"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`form-control ${
                formik.touched.subject && formik.errors.subject
                  ? "is-invalid"
                  : ""
              }`}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: isDark ? "#23272f" : "#fff",
                color: isDark ? "#fff" : "#000",
              }}
            />
            {formik.touched.subject && formik.errors.subject && (
              <div className="text-danger">{formik.errors.subject}</div>
            )}

            <label className="fw-bold">Support Query:</label>
            <div
              className={`editor-wrapper ${isDark ? "editor-dark" : ""}`}
              style={{
                marginBottom: "10px",
                height: "200px",
                overflow: "auto",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              <CKEditor
                editor={ClassicEditor}
                data={formik.values.support_query}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "blockQuote",
                    "undo",
                    "redo",
                  ],

                  removePlugins: [
                    "Image",
                    "ImageToolbar",
                    "ImageCaption",
                    "ImageStyle",
                    "ImageUpload",
                    "MediaEmbed",
                    "Link",
                    "CKFinder",
                    "EasyImage",
                  ],
                }}
                onChange={(_, editor) =>
                  formik.setFieldValue("support_query", editor.getData())
                }
                onBlur={() => formik.setFieldTouched("support_query", true)}
              />
            </div>
            {formik.touched.support_query && formik.errors.support_query && (
              <div className="text-danger mb-2">
                {formik.errors.support_query}
              </div>
            )}

            <label htmlFor="File" className="fw-bold">
              File
            </label>

            <input
              type="file"
              className="form-control darkcard font-size17 customFileInput"
              id="File"
              name="attachments"
              multiple
              accept=".pdf,.jpeg,.png,.xls,.xlsx,.csv,.gif"
              onChange={(e) => {
                formik.setFieldValue("attachments", [...e.target.files]);
              }}
              ref={fileInputRef}
              style={{ marginBottom: "8px" }}
            />
            <small
              // className='text-muted'
              style={{ color: theme === "dark" ? "#fff" : "#ggg" }}
            >
              Supported files: jpeg, png, pdf, xls, xlsx, csv
            </small>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isLoading}
              style={{
                marginTop: "1rem",
                padding: "10px 16px",
                backgroundColor: " #33B1FF",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {mutation.isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HelpSupportModal;
