import { useRef, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

const REJECT_OPTIONS = [
  { label: "Relieved", value: "relieved" },
  { label: "Absconded", value: "absconded" },
  { label: "Terminated", value: "terminated" },
];

const SUPPORTED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const PostPayloadDelete = ({
  closeAllModals,
  apiEndPoint,
  postEndPoint,
  onSuccessAction,
  payloadKey,
  queryKey,
  type,
  chart_id,
  chart_uid,
  team_id,
  agreeId,
  data,
  setData,
  projectName,
  agreeWith,
  agreeType,
  clearFormikValues,
}) => {
  const queryClient = useQueryClient();
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const method = postEndPoint ? "post" : "delete";
  const endPoint = method === "post" ? postEndPoint : apiEndPoint;
  const auth = useAuth();

  const { role } = auth.user;

  const isAgree = agreeType === "agree";
  const isDisagree = agreeType === "disagree";
  const isSme = role === "sme";
  const isCoder = role === "coder";
  const isAuditor = role === "auditor";

  const fileInputRef = useRef(null);
  const [disagreeCount, setDisagreeCount] = useState(0);
  const [disagreeComment, setDisagreeComment] = useState("");
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const getValidationSchema = () => {
    if (isSme) {
      return yup.object({
        comment: yup.string().required("Comments field is required"),
      });
    }

    if (
      (type === "dropdown" && payloadKey === "reason") ||
      payloadKey === "comments"
    ) {
      return yup.object({
        [payloadKey]: yup.string().required("Reason is required"),
      });
    }

    if (projectName == clientR) {
      if (isCoder && isAgree) return yup.object({});
      if (isAuditor && isDisagree) {
        return yup.object({
          disagreeComment: yup.string().required("Comments field is required"),
        });
      }
      return yup.object({});
    }

    if (isCoder && isAgree) {
      return yup.object({
        evidences: yup
          .mixed()
          .required("Evidence is required")
          .test(
            "fileSize",
            "File size must be less than 5MB",
            (value) => !value || value.size <= MAX_FILE_SIZE
          )
          .test(
            "fileType",
            "Only JPG, JPEG, and PNG files are allowed",
            (value) => value && SUPPORTED_FILE_TYPES.includes(value.type)
          ),
      });
    }

    if (isCoder && isDisagree) {
      return yup.object({
        evidences: yup
          .mixed()
          .required("Evidence is required")
          .test(
            "fileSize",
            "File size must be less than 5MB",
            (value) => !value || value.size <= MAX_FILE_SIZE
          )
          .test(
            "fileType",
            "Only JPG, JPEG, and PNG files are allowed",
            (value) => value && SUPPORTED_FILE_TYPES.includes(value.type)
          ),
        disagreeCount: yup
          .number()
          .required("Disagree count is required")
          .min(1, "Disagree count must be at least 1"),
        disagreeComment: yup.string().required("Comments field is required"),
      });
    }

    if (isAuditor && isDisagree) {
      return yup.object({
        disagreeComment: yup.string().required("Comments field is required"),
      });
    }

    return yup.object({});
  };

  const { data: projectID } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: async () => (await apiClient.get("get-current-user-data")).data,
    staleTime: 5 * 60 * 1000,
  });
  const project_id = projectID?.data?.this_project;

  const mutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        [payloadKey]: values[payloadKey] || "",
        team_id,
        chart_id,
        chart_uid,
      };

      if (method === "delete") {
        return apiClient.delete(endPoint, {
          data: { [payloadKey]: values[payloadKey] },
        });
      }

      if (type === "file") {
        const formData = new FormData();
        const file = values.evidences;

        if (file) formData.append("evidences[]", file);

        if (isDisagree) {
          formData.append("comment", disagreeComment);
        }
        if (
          auth.user.role === "coder" &&
          isDisagree &&
          projectName !== clientR
        ) {
          formData.append("coder_disagree_count", disagreeCount);
          formData.append("coder_disagree_comment", disagreeComment);
        }
        if (isSme) formData.append("comment", comment);

        if (queryKey === "searchResults" || payloadKey === "comments") {
          formData.append("team_id", team_id);
          formData.append("chart_id", chart_id);
          formData.append("chart_uid", chart_uid);
        }
        if (payloadKey === "rejection_reason") {
          formData.append("rejection_reason", rejectionReason);
        }
        return apiClient.post(endPoint, formData);
      }

      return apiClient.post(endPoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);

      if (queryKey !== "searchResults") {
        const updatedData = {
          ...data,
          error_feedback:
            data?.error_feedback?.filter((item) => item.id !== agreeId) || [],
        };
        setData(updatedData);
        closeAllModals(false);
        return apiClient.get("feedback/list");
      }

      onSuccessAction?.();
      fileInputRef.current && (fileInputRef.current.value = "");
      clearFormikValues();
      closeAllModals(false);
    },
    onError: (err) => {
      err.response?.data?.errors && formik.setErrors(err.response.data.errors);
    },
  });

  const handleFileChange = (event) => {
    formik.setFieldValue("evidences", event.currentTarget.files[0]);
  };

  const formik = useFormik({
    initialValues: {
      [payloadKey]: ["reason", "comment", "rejection_reason"].includes(
        payloadKey
      )
        ? payloadKey
        : "",
      disagreeComment: "",
      disagreeCount: "",
    },
    validationSchema: getValidationSchema(),
    onSubmit: (values) => {
      mutation.mutate(values);
      formik.resetForm();
      closeAllModals(false);
    },
  });

  const getButtonText = () => {
    if (isAgree) {
      if (agreeWith === "auditor") return "Auditor Agree";
      if (agreeWith === "coder") return "Coder Agree";
      return "Agree";
    }
    if (isDisagree) return "Disagree";
    if (type === "dropdown") return "Submit";
    if (method === "delete") return "Delete";
    return "Submit";
  };

  const renderTextArea = (name, value, setValue, label, required = true) => (
    <div className="col-12 mb-2">
      <label
        htmlFor={name}
        className={`form-label ${required ? "required" : ""}`}
      >
        {label}
      </label>
      <textarea
        className={`form-control font-size13 custom-inputborder ${
          formik.touched[name] && formik.errors[name] ? "is-invalid" : ""
        }`}
        id={name}
        name={name}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          formik.setFieldValue(name, e.target.value);
        }}
        onBlur={formik.handleBlur}
        rows={3}
      />
      {formik.touched[name] && formik.errors[name] && (
        <div className="invalid-feedback">{formik.errors[name]}</div>
      )}
    </div>
  );

  const renderActionButtons = () => (
    <div className="w-100 d-flex justify-content-end ms-2 mt-3">
      <button
        type="submit"
        className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
        disabled={mutation.isPending || !formik.isValid}
      >
        {mutation.isPending ? "Loading..." : getButtonText()}
      </button>
      <button
        type="button"
        className="btn btn-secondary ms-2"
        onClick={() => closeAllModals(false)}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="row gy-2 px-2 flex-column">
        {isSme && renderTextArea("comment", comment, setComment, "Comment")}

        {payloadKey === "rejection_reason" &&
          renderTextArea(
            "rejection_reason",
            rejectionReason,
            setRejectionReason,
            "Comment"
          )}

        {projectName == clientR ? (
          <>
            {isAgree && (
              <>
                <label htmlFor={payloadKey} className="form-label required">
                  Are you sure you want to Agree?
                </label>
                {renderActionButtons()}
              </>
            )}

            {isDisagree && (
              <>
                {renderTextArea(
                  "disagreeComment",
                  disagreeComment,
                  setDisagreeComment,
                  "Comment"
                )}
                {renderActionButtons()}
              </>
            )}
          </>
        ) : (
          <>
            <div className="col-12">
              <h6 className="mb-0 font-size13 pb-2">
                {isDisagree
                  ? "If you want to Disagree? Please fill those details !!"
                  : isAgree && "Are you sure you want to Agree?"}
              </h6>

              {type === "dropdown" || payloadKey === "reason" ? (
                <>
                  <label htmlFor={payloadKey} className="form-label required">
                    Reason
                  </label>
                  <Select
                    classNamePrefix="custom-select"
                    className={`font-size13 ${
                      formik.touched[payloadKey] && formik.errors[payloadKey]
                        ? "is-invalid"
                        : ""
                    }`}
                    isSearchable
                    name={payloadKey}
                    options={REJECT_OPTIONS}
                    value={REJECT_OPTIONS.find(
                      (option) => option.value === formik.values[payloadKey]
                    )}
                    onChange={(selectedOption) => {
                      formik.setFieldValue(
                        payloadKey,
                        selectedOption?.value || ""
                      );
                    }}
                    onBlur={() => formik.setFieldTouched(payloadKey, true)}
                  />
                  <div className="invalid-feedback">
                    {formik.errors[payloadKey]}
                  </div>
                </>
              ) : (
                queryKey === "searchResults" && (
                  <>
                    <label htmlFor={payloadKey} className="form-label required">
                      Reason
                    </label>
                    <textarea
                      className={`form-control font-size13 custom-inputborder ${
                        formik.touched[payloadKey] &&
                        formik.errors[payloadKey] &&
                        "is-invalid"
                      }`}
                      id={payloadKey}
                      // required
                      placeholder="Enter Reason"
                      name={payloadKey}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values[payloadKey]}
                    />
                    <div className="invalid-feedback">
                      {formik.errors[payloadKey]}
                    </div>
                  </>
                )
              )}

              {type === "file" && isCoder && (
                <>
                  <label htmlFor={payloadKey} className="form-label required">
                    Evidence
                  </label>
                  <input
                    type="file"
                    className={`form-control darkcard font-size17 customFileInput ${
                      formik.touched.evidences && formik.errors.evidences
                        ? "is-invalid"
                        : ""
                    }`}
                    id={payloadKey}
                    name={payloadKey}
                    onChange={handleFileChange}
                    onBlur={formik.handleBlur}
                    accept=".jpg,.jpeg,.png"
                    ref={fileInputRef}
                  />
                  <small className="text-muted t-files">
                    Do not upload any sensitive data. Supported file types:
                    jpeg, jpg, png (Max 5MB)
                  </small>
                  <div className="invalid-feedback">
                    {formik.errors.evidences}
                  </div>
                </>
              )}

              {isCoder && isDisagree && (
                <div className="col-12 mb-4">
                  <label
                    htmlFor="disagreeCount"
                    className="form-label required"
                  >
                    Disagree Count
                  </label>
                  <input
                    type="number"
                    className={`form-control font-size13 custom-inputborder ${
                      formik.touched.disagreeCount &&
                      formik.errors.disagreeCount
                        ? "is-invalid"
                        : ""
                    }`}
                    id="disagreeCount"
                    name="disagreeCount"
                    value={disagreeCount}
                    onChange={(e) => {
                      setDisagreeCount(e.target.value);
                      formik.setFieldValue("disagreeCount", e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                  />
                  <div className="invalid-feedback">
                    {formik.errors.disagreeCount}
                  </div>
                </div>
              )}

              {(isDisagree || (isAuditor && isDisagree)) &&
                renderTextArea(
                  "disagreeComment",
                  disagreeComment,
                  setDisagreeComment,
                  "Comment"
                )}
            </div>

            {renderActionButtons()}
          </>
        )}
      </div>
    </form>
  );
};

export default PostPayloadDelete;
