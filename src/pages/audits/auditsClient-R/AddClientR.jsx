import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import apiClient from "../../../services/apiClient";
import Select from "react-select";
import { FaArrowRight } from "react-icons/fa6";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "react-toastify";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { RiDeleteBin6Line } from "react-icons/ri";
import * as yup from "yup";

const AddClientR = () => {
  const queryClient = useQueryClient();
  const [chartDetails, setChartDetails] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [totalErrors, setTotalErrors] = useState("");
  const [errorStatus, setErrorStatus] = useState("no");
  const [showResetAuditorErrModal, setshowResetAuditorErrModal] =
    useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const formik = useFormik({
    initialValues: {
      chart_id: "",
      coding_complete_date: "",
      sub_project_name: "",
      project_name: "",
      audit_complete_date: new Date(),
      primary_error_status: "no",
      error_fields: [],
      primary_chart_id: "",
      icd_codes: "",
      coder_name: "",
      total_pages: "",
      audit_comment: "",
      icd_qa_score: 100,
      chart_qa_score: 0,
    },
    validationSchema: yup.object({
      chart_id: yup
        .string()
        .required("Chase ID is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !")
        .min(8, "Must be 8 numbers !"),

      error_fields: yup
        .array()
        .of(yup.object())
        .test(
          "require-error-fields-if-errors-comment",
          "Please add at least one error detail.",
          function (value) {
            const { audit_comment } = this.parent;

            if (
              audit_comment?.trim().toLowerCase() === "errors" &&
              (!value || value.length === 0)
            ) {
              return false;
            }
            return true;
          }
        ),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post("auditors/store/client_r", values, {
        componentName: "addcharts",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["getCharts"]);
      formik.resetForm();
      setChartDetails(null);
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const checkChartIdUnique = useDebouncedCallback(async (chartId) => {
    if (!chartId || chartId.length < 9) return;

    try {
      await apiClient.get(`auditors/validate/chart-data?chart_id=${chartId}`);
    } catch (err) {
      if (err.response?.data?.errors?.chart_id) {
        formik.setFieldError("chart_id", err.response.data.errors.chart_id[0]);
      }
    }
  }, 500);

  const handleChartIdChange = (e) => {
    formik.handleChange(e);
    checkChartIdUnique(e.target.value);
  };

  // Bind default attributes from coder chart id chart exist
  useEffect(() => {
    if (chartDetails) {
      formik.setFieldValue("coder_name", chartDetails.user.name);
      formik.setFieldValue("total_pages", chartDetails.pages);
      formik.setFieldValue("icd_codes", chartDetails.icd);
      formik.setFieldValue("primary_error_status", "no");
      formik.setFieldValue("total_errors", 0);
      setErrorStatus("no");

      formik.setFieldValue(
        "coding_complete_date",
        new Date(chartDetails.created_at)
      );
    }
  }, [chartDetails]);

  useEffect(() => {
    setChartDetails("");
    formik.setFieldValue("coder_name", "");
    formik.setFieldValue("total_pages", "");
    formik.setFieldValue("coding_complete_date", "");
    formik.setFieldValue("icd_codes", "");
  }, [formik.values.chart_id]);

  // Operation for changing error status
  useEffect(() => {
    const errFieldsCount = formik.values.error_fields?.length;

    if (errorStatus === "no") {
      formik.setFieldValue("audit_comment", "No Errors, Great Job!!!");

      if (errFieldsCount > 0) {
        formik.setFieldValue("error_fields", []);
        setshowResetAuditorErrModal(true);
      }
    } else if (errorStatus === "yes") {
      formik.setFieldValue("audit_comment", "errors");
    }

    formik.setFieldValue("primary_error_status", errorStatus);
  }, [errorStatus]);

  // Add new error fields
  const addErrorFields = (e) => {
    e.preventDefault();
    const newField = [
      {
        error_count: "",
        hcc_category: "",
        primary_error: "",
        secondary_comments: "",
        comment_3: "",
        secondary_comment: "",
      },
    ];

    formik.setFieldValue("error_fields", [
      ...formik.values.error_fields,
      ...newField,
    ]);
  };

  // Remove error row based on key
  const removeErrorFields = (e, index) => {
    e.preventDefault();
    const overAllErrFields = [...formik.values.error_fields];
    overAllErrFields.splice(index, 1);
    formik.setFieldValue("error_fields", overAllErrFields);
  };

  // Calculate total Errors
  useEffect(() => {
    const errFieldsArr = formik.values.error_fields;
    const totalErrorCount = errFieldsArr.reduce((accumulator, field) => {
      return accumulator + Number(field.error_count);
    }, 0);
    formik.setFieldValue("total_errors", totalErrorCount);

    setTotalErrors(totalErrorCount);
  }, [formik.values.error_fields]);

  // Calculate QA Score - quality
  useEffect(() => {
    if (totalErrors && chartDetails) {
      let finalValue =
        100 - (Number(totalErrors) / Number(formik.values.icd_codes)) * 100;
      if (formik.values.error_fields.length) {
        formik.setFieldValue("icd_qa_score", finalValue);
      } else {
        formik.setFieldValue("icd_qa_score", 100);
      }
    }
  }, [totalErrors, formik.values.error_fields, formik.values.icd_codes]);

  // Calculate QA Score - error
  useEffect(() => {
    if (totalErrors && chartDetails) {
      let finalValue =
        (Number(totalErrors) / Number(formik.values.icd_codes)) * 100;
      if (formik.values.error_fields.length) {
        formik.setFieldValue("chart_qa_score", finalValue);
      } else {
        formik.setFieldValue("chart_qa_score", 0);
      }
    }
  }, [totalErrors, formik.values.error_fields, formik.values.icd_codes]);

  const fetchChartDetails = async (chartId) => {
    try {
      if (chartId && chartId.length >= 8) {
        const { data } = await apiClient.get(
          `auditors/validate/chart-data/${chartId}`
        );
        setShowCanvas(true);
        setChartDetails(data.data);
        formik.setFieldValue("primary_chart_id", data.data.id);
        formik.setErrors({});
        formik.setTouched({}, false);
        toast.success(data.message || "Chart data loaded successfully.");
      } else if (chartId.length === 0) {
        formik.setErrors({
          chart_id: "Chart Id is required.",
        });
      }
    } catch (err) {
      toast.error(err.response?.data.message);
      formik.setErrors({
        chart_id: err.response.data.message,
      });
    }
  };
  const SelectErrorList = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" },
  ];

  const SelectTypeList = [
    { value: "valid_changed_to_invalid", label: "Valid Changed To Invalid" },
    { value: "invalid_changed_to_valid", label: "Invalid Changed To Valid" },
    { value: "valid_changed_to_valid", label: "Valid Changed To Valid" },
    { value: "added", label: "Added" },
    { value: "deleted", label: "Deleted" },
    { value: "educational", label: "Educational" },
    { value: "provider_name_error", label: "Provider Name Error" },
    { value: "flag", label: "Flag" },
    { value: "signature_error", label: "Signature Error" },
    { value: "dos", label: "DOS" },
  ];

  const staticErrorDropdowns = [
    {
      name: "err_status",
      options: SelectErrorList,
      isMulti: false,
      isMandatory: true,
    },
  ];

  const staticTypeDropdowns = [
    {
      name: "type",
      options: SelectTypeList,
      isMulti: false,
      isMandatory: true,
    },
  ];
  return (
    <div className="card cus-card darkcard">
      <div className="d-flex justify-content-between m-2">
        {showCanvas && chartDetails && (
          <div className=" ">
            <button
              className="btn btn-primary hover-primary-btn custom-primary-btn font-size13 py-2 px-4"
              onClick={handleShow}
            >
              {chartDetails.chart_id ?? ""}
              <FaArrowRight className="ms-2" />
            </button>
          </div>
        )}
      </div>

      <div className="card-body ">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-end justify-content-start gy-2 px-2">
            {/* Chase Section */}
            <div className="col-lg-3 px-1">
              <label htmlFor="chart_id" className="form-label required">
                Chase ID
              </label>
              <div className="d-flex">
                <input
                  type="text"
                  className={`form-control font-size13 custom-inputborder  ${
                    formik.touched.chart_id &&
                    formik.errors.chart_id &&
                    "is-invalid"
                  }`}
                  id="chart_id"
                  maxLength={8}
                  name="chart_id"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.chart_id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchChartDetails(formik.values.chart_id);
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedValue = e.clipboardData.getData("text").trim();
                    formik.setFieldValue("chart_id", pastedValue);
                  }}
                />
                <button
                  className="btn btn-primary custom-primary-btn outline-none border-0 ms-2"
                  type="button"
                  id="button-addon2"
                  onClick={() => fetchChartDetails(formik.values.chart_id)}
                >
                  <FaSearch className="" />
                </button>
              </div>

              {formik.touched.chart_id && formik.errors.chart_id ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.chart_id}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            {/*  Total HCC Category Reviewed Section */}
            <div className="col-lg-3 px-1">
              <label htmlFor="icd_codes" className="form-label ">
                Total HCC Category Reviewed
              </label>
              <input
                type="text"
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.icd && formik.errors.icd && "is-invalid"
                }`}
                id="icd_codes"
                // placeholder="Enter DX Level QAscore"

                name="icd_codes"
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("icd_codes", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.icd_codes}
              />
              {formik.touched.icd_codes && formik.errors.icd_codes ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.icd_codes}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            {/* AuditCompleteDate Section */}
            <div className="col-lg-3 px-1">
              <label htmlFor="AuditCompleteDate" className="form-label">
                Audit Complete Date
              </label>
              <div className="">
                <DatePicker
                  className="form-control font-size13"
                  disabled
                  selected={
                    formik.values.audit_complete_date
                      ? new Date(formik.values.audit_complete_date)
                      : null
                  }
                  maxDate={new Date()}
                  onChange={(date) => {
                    const formattedDate = date
                      ? date.toISOString().split("T")[0]
                      : null;
                    formik.setFieldValue("audit_complete_date", formattedDate);
                  }}
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              {formik.touched.audit_complete_date &&
              formik.errors.audit_complete_date ? (
                <div id="role" className="invalid-feedback font-size13">
                  {formik.errors.audit_complete_date}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            {/* QA score Section - Quality score */}
            <div className="col-lg-3 px-1">
              <label htmlFor="icd_qa_score" className="form-label ">
                QA score
              </label>
              <input
                type="text"
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.icd_qa_score &&
                  formik.errors.icd_qa_score &&
                  "is-invalid"
                }`}
                id="icd_qa_score"
                // placeholder="Enter DX Level QAscore"
                disabled
                name="icd_qa_score"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.icd_qa_score}
              />
              {formik.touched.icd_qa_score && formik.errors.icd_qa_score ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.icd_qa_score}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            {/* QA score Section - error percentage */}
            <div className="col-lg-3 px-1">
              <label htmlFor="chart_qa_score" className="form-label ">
                Error Percentage
              </label>
              <input
                type="text"
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.chart_qa_score &&
                  formik.errors.chart_qa_score &&
                  "is-invalid"
                }`}
                id="chart_qa_score"
                disabled
                name="chart_qa_score"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.chart_qa_score}
              />
              {formik.touched.chart_qa_score && formik.errors.chart_qa_score ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.chart_qa_score}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            <Offcanvas
              show={show}
              onHide={handleClose}
              placement="end"
              style={{ width: "40%" }}
              className="darkcard-modal"
            >
              <Offcanvas.Header>
                <Offcanvas.Title></Offcanvas.Title>
                <button
                  type="button"
                  className="btn-close ms-auto filtered-image"
                  aria-label="Close"
                  onClick={handleClose}
                ></button>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="text-custom-color">
                        {formik.values.chart_id.length === 8
                          ? "Chase ID"
                          : "Chart ID"}
                        <span className="text-dark h6 ms-3">
                          {formik.values.chart_id}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-custom-color mb-0">
                        Coder name
                        <span className="text-dark h6 ms-3">
                          {formik.values.coder_name}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="text-custom-color mb-0">Project name</p>
                      <span className="text-data-color h6">
                        {chartDetails && chartDetails?.project?.project_name}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <p className="text-custom-color mb-0">Sub Project name</p>
                      <span className="text-data-color h6">
                        {chartDetails && chartDetails?.sub_project_name}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="text-custom-color mb-0">Member name</p>
                      <span className="text-data-color h6">
                        {chartDetails && chartDetails?.member_name}
                      </span>
                    </div>

                    <div className="col-md-6">
                      <p className="text-custom-color mb-0">Total pages</p>
                      <span className="text-data-color h6">
                        {formik.values.total_pages}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="text-custom-color mb-0">
                        DOB <small>(YYYY-MM-DD)</small>
                      </p>
                      <span className="text-data-color h6">
                        {chartDetails && chartDetails?.dob.slice(0, 10)}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <p className="text-custom-color mb-0">
                        Coding complete date <small>(YYYY-MM-DD)</small>
                      </p>
                      <span className="text-data-color h6">
                        {chartDetails && chartDetails?.coding_at.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                  {
                    <div className="row mb-4">
                      <div className="col-6">
                        <p className="text-custom-color mb-0">Coder comment</p>
                        <span className="text-data-color h6">
                          {chartDetails && chartDetails.comments ? (
                            chartDetails.comments
                          ) : (
                            <span className="text-muted">NA</span>
                          )}
                        </span>
                      </div>
                      <div className="col-6">
                        <p className="text-custom-color mb-0">Project Type</p>
                        <span className="text-data-color h6">
                          {chartDetails && chartDetails.project_type ? (
                            chartDetails.project_type
                          ) : (
                            <span className="text-muted">NA</span>
                          )}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </Offcanvas.Body>
            </Offcanvas>
            {/* Dynamic error fields */}
            <div className="row  px-lg-2">
              <div className=" d-flex justify-content-start align-content-center col-lg px-1 mb-2 mt-5">
                <label htmlFor="error_check" className="form-label required">
                  Need to add error?
                </label>

                <div className="d-inline ms-3">
                  <div className="custom-toggle-switch">
                    <span
                      className={`toggle-label  ${
                        errorStatus === "no" ? "no-active" : ""
                      }`}
                    >
                      No
                    </span>
                    <label className="switch" style={{ margin: "0 8px" }}>
                      <input
                        type="checkbox"
                        checked={errorStatus === "yes"}
                        onChange={(e) => {
                          const value = e.target.checked ? "yes" : "no";
                          setErrorStatus(value);
                          formik.setFieldValue("primary_error_status", value);
                        }}
                      />
                      <span className="slider"></span>
                    </label>
                    <span
                      className={`toggle-label ${
                        errorStatus === "yes" ? "yes-active" : ""
                      }`}
                    >
                      Yes
                    </span>
                  </div>
                  {/* {formik.touched.error_fields && formik.errors.error_fields ? (
                    <div id="error_fields" className="invalid-feedback d-block">
                      {formik.errors.error_fields}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )} */}
                </div>
                {formik.touched.error_fields && formik.errors.error_fields ? (
                  <div
                    id="error_fields"
                    className="invalid-feedback d-block ms-2"
                  >
                    {formik.errors.error_fields}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
              {errorStatus === "yes" && chartDetails ? (
                <>
                  <div className="col-lg-3 px-1 w-100">
                    <div className="d-flex justify-content-end">
                      <button
                        className=" btn btn-primary custom-primary-btn font-size13 py-2 px-4"
                        onClick={(e) => addErrorFields(e)}
                      >
                        Add Errors
                        <FaPlus className="ms-2" />
                      </button>
                    </div>
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  </div>
                </>
              ) : null}
              {errorStatus === "no" ? (
                <>
                  <div className="col-lg-3  px-1">
                    <label
                      htmlFor="auditor_comment"
                      className="form-label required"
                    >
                      Auditor comments
                    </label>

                    <input
                      type="text"
                      className="form-control font-size13 custom-inputborder  "
                      value="No Errors, Great Job!!!"
                      disabled
                    />
                  </div>
                </>
              ) : null}
            </div>

            {errorStatus === "yes" && (
              // <div className="table-responsive" style={{ maxHeight: "300px" }}>
              <div className="overflow-auto">
                <table className="table">
                  <thead className="font-size13">
                    <tr>
                      <th scope="col" className="text-center">
                        S.No
                      </th>
                      <th scope="col">
                        <span className="required">
                          Total No of Error <span className="requireds">*</span>
                        </span>
                      </th>
                      <th scope="col">
                        <span className="required">
                          HCC Category <span className="requireds">*</span>
                        </span>
                      </th>
                      <th scope="col">
                        <span className="required">
                          Primary Error Comments
                          <span className="requireds">*</span>
                        </span>
                      </th>
                      <th scope="col">
                        <span className="required">
                          Secondary Error Comments
                          <span className="requireds">*</span>
                        </span>
                      </th>
                      <th scope="col" className="text-center">
                        <span className="required">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-size13 font-weight-light">
                    {formik.values?.error_fields?.length ? (
                      formik.values.error_fields.map((inputFields, index) => (
                        <tr key={index} className="">
                          <td className="text-black border-bottom-0 text-center">
                            <div className="invisible">
                              <span>invisible</span>
                            </div>
                            <div className="audit-error"> {index + 1}</div>
                          </td>
                          <td>
                            {staticErrorDropdowns.map(
                              ({
                                name,
                                label,
                                options,
                                isMulti,
                                isMandatory,
                              }) => {
                                const filedName = `error_fields.${index}.error_count`;

                                return (
                                  <div key={name} className=" w-full pt-4">
                                    <Select
                                      classNamePrefix="custom-select"
                                      className={`font-size13 ${
                                        formik.touched?.error_fields?.[index]
                                          ?.error_count &&
                                        formik.errors?.error_fields?.[index]
                                          ?.error_count
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      isMulti={isMulti}
                                      isSearchable
                                      options={options}
                                      name={filedName}
                                      id={`error_count${index}`}
                                      value={
                                        isMulti
                                          ? options.filter((option) =>
                                              formik.values?.error_fields?.[
                                                index
                                              ]?.error_count?.includes(
                                                option.value
                                              )
                                            )
                                          : options.find(
                                              (option) =>
                                                option.value ===
                                                formik.values?.error_fields?.[
                                                  index
                                                ]?.error_count
                                            ) || null
                                      }
                                      onChange={(selectedOption) => {
                                        formik.setFieldValue(
                                          filedName,
                                          isMulti
                                            ? selectedOption.map(
                                                (opt) => opt.value
                                              )
                                            : selectedOption?.value || ""
                                        );
                                      }}
                                      onBlur={() =>
                                        formik.setFieldTouched(filedName, true)
                                      }
                                      menuPlacement="auto"
                                      menuPosition="fixed"
                                    />

                                    {formik.touched?.error_fields?.[index]
                                      ?.error_count &&
                                    formik.errors?.error_fields?.[index]
                                      ?.error_count ? (
                                      <div className="invalid-feedback">
                                        {
                                          formik.errors.error_fields[index]
                                            .error_count
                                        }
                                      </div>
                                    ) : (
                                      <div className="invisible">
                                        <span>invisible</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </td>
                          {inputFields.error_count !== "admin" ? (
                            <td>
                              <div className="w-full">
                                <textarea
                                  type="text"
                                  name={`error_fields.${index}.hcc_category`}
                                  // rows={2}
                                  className={`form-control font-size13 custom-inputborder mt-2  ${
                                    formik.touched.hcc_category &&
                                    formik.errors.hcc_category &&
                                    "is-invalid"
                                  }`}
                                  id={`hcc_category_${index}`}
                                  style={{ height: "10px" }}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  value={inputFields.hcc_category}
                                  // placeholder="HCC Category"
                                ></textarea>
                                {formik.errors ? (
                                  <div
                                    id="error_count"
                                    className="invalid-feedback d-block"
                                  >
                                    {
                                      formik.errors[
                                        `error_fields.${index}.hcc_category`
                                      ]
                                    }
                                  </div>
                                ) : (
                                  <div className="invisible">
                                    <span>invisible</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          ) : (
                            ""
                          )}
                          <td>
                            {staticTypeDropdowns.map(
                              ({
                                name,
                                label,
                                options,
                                isMulti,
                                isMandatory,
                              }) => {
                                const filedName = `error_fields.${index}.primary_error`;

                                return (
                                  <div key={name} className=" w-full pt-4">
                                    <Select
                                      classNamePrefix="custom-select"
                                      className={`font-size13 ${
                                        formik.touched?.error_fields?.[index]
                                          ?.primary_error &&
                                        formik.errors?.error_fields?.[index]
                                          ?.primary_error
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      isMulti={isMulti}
                                      isSearchable
                                      options={options}
                                      name={filedName}
                                      id={`primary_error`}
                                      value={
                                        isMulti
                                          ? options.filter((option) =>
                                              formik.values?.error_fields?.[
                                                index
                                              ]?.primary_error?.includes(
                                                option.value
                                              )
                                            )
                                          : options.find(
                                              (option) =>
                                                option.value ===
                                                formik.values?.error_fields?.[
                                                  index
                                                ]?.primary_error
                                            ) || null
                                      }
                                      onChange={(selectedOption) => {
                                        formik.setFieldValue(
                                          filedName,
                                          isMulti
                                            ? selectedOption.map(
                                                (opt) => opt.value
                                              )
                                            : selectedOption?.value || ""
                                        );
                                      }}
                                      onBlur={() =>
                                        formik.setFieldTouched(filedName, true)
                                      }
                                      menuPlacement="auto"
                                      menuPosition="fixed"
                                    />
                                    {formik.touched?.error_fields?.[index]
                                      ?.primary_error &&
                                    formik.errors?.error_fields?.[index]
                                      ?.primary_error ? (
                                      <div className="invalid-feedback">
                                        {
                                          formik.errors.error_fields[index]
                                            .primary_error
                                        }
                                      </div>
                                    ) : (
                                      <div className="invisible">
                                        <span>invisible</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </td>
                          <td>
                            <div className="w-full">
                              <textarea
                                type="text"
                                name={`error_fields.${index}.secondary_comment`}
                                // rows={2}
                                className={`form-control  font-size13 custom-inputborder mt-2 ${
                                  formik.touched.secondary_comment &&
                                  formik.errors.secondary_comment &&
                                  "is-invalid"
                                }`}
                                id="secondary_comment"
                                style={{ height: "10px" }}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={inputFields.secondary_comment}
                                // placeholder="HCC Category"
                              ></textarea>
                              {formik.errors ? (
                                <div
                                  id="error_count"
                                  className="invalid-feedback d-block"
                                >
                                  {
                                    formik.errors[
                                      `error_fields.${index}.secondary_comment`
                                    ]
                                  }
                                </div>
                              ) : (
                                <div className="invisible">
                                  <span>invisible</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className=" text-center">
                            <div className="invisible">
                              <span>invisible</span>
                            </div>
                            <div className="error-container mt-3">
                              <OverlayTrigger
                                overlay={
                                  <Tooltip className="text-cap">Delete</Tooltip>
                                }
                                container={this}
                                placement="bottom"
                              >
                                <button
                                  onClick={(e) => removeErrorFields(e, index)}
                                >
                                  <RiDeleteBin6Line className="bi-delete" />
                                </button>
                              </OverlayTrigger>
                            </div>
                            {/* )} */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={15} className="text-center text-black">
                          There's no errors added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="col-lg-3  w-100">
              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <span>Loading...</span> : "Add Audit"}
                  <FaArrowRight className="ms-2" />
                </button>
              </div>
              <div className="invisible">
                <span>invisible</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientR;
