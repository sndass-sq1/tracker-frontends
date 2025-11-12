import { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import apiClient from "../../../services/apiClient";
import * as yup from "yup";
import { FaArrowRight } from "react-icons/fa6";
import Select from "react-select";
import { FaSearch, FaPlus } from "react-icons/fa";
import { format, parse } from "date-fns";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { UserContext } from "../../UserContext/UserContext";
import ModalComp from "../../../components/ModalComp";
import DropdownOptions from "../../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import { useMemo } from "react";
import { ucFirst } from "../../../utils/ucFirst";

const AddAnthem = () => {
  const queryClient = useQueryClient();
  const anthem_project_id = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const [isErrFieldRpActive, setisErrFieldRpActive] = useState(false);
  const [chartDetails, setChartDetails] = useState(null);
  const [isErrFieldDosActive, setisErrFieldDosActive] = useState(false);
  const [isErrFieldCommentActive, setisErrFieldCommentActive] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [errorStatus, setErrorStatus] = useState("no");
  const [selectedAuditMode, setSelectedAuditMode] = useState("default_audit");
  const [showConfirmManualAudit, setShowConfirmManualAudit] = useState(false);

  const [isErrFieldSignatureActive, setisErrFieldSignatureActive] =
    useState(false);
  const [showResetAuditorErrModal, setshowResetAuditorErrModal] =
    useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [searchQueries, setSearchQueries] = useState({
    project_id: "",
    sub_project_id: "",
  });
  const [currentChartId, setCurrentChartId] = useState("");
  const [showsearch, setShowSearch] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const baseSchema = {
    chart_uid: yup
      .string()
      // .matches(
      //   /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      //   "Must be a valid Chart ID!"
      // )
      .min(36, "Must be 36 UID characters !")
      .required("Chart ID is required !"),

    audit_type: yup.string().required("Audit Type is required !"),

    original_code_found: yup
      .string()
      .required("Original Code Found is required !")
      .matches(/^[0-9]+$/, "Must contain only numbers !"),

    dx_level_comment_code_corrected: yup
      .string()
      .required("DXlevel Comment code corrected is required !")
      .matches(/^[0-9]+$/, "Must contain only numbers !"),

    pos_corrected: yup
      .string()
      .required("POS corrected is required !")
      .matches(/^[0-9]+$/, "Must contain only numbers !"),
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
  };

  // extra rules only for manual audit
  const manualAuditSchema = {
    project_id: yup.string().required("Project Name is required !"),
    sub_project_id: yup.string().required("Sub Project is required !"),
    project_type: yup.string().required("Project Type is required !"),
    member_name: yup
      .string()
      .matches(/^[A-Za-z\s\-,_'’.]+$/, "Invalid member name")
      .min(3, "Too Short!")
      .max(30, "Must be 30 characters or less!")
      .required("Member Name is required!"),
    dos: yup
      .string()
      .required("Total DOS is required !")
      .matches(/^[0-9]+$/, "Must contain only numbers !"),
    dob: yup.string().required("DOB is required !"),
    icd: yup
      .string()
      .required("Total ICD is required !")
      .matches(/^[0-9]+$/, "Must contain only numbers !"),
    pages: yup
      .string()
      .required("Total Pages is required !")
      .matches(/^[0-9]+$/, "Must contain only numbers !"),
    no_of_dx_found_in_extractor: yup
      .number()
      .typeError("Must be a number!")
      .required("DX Found Extractor is required!")
      .integer("Must be an integer")
      .min(0, "Cannot be negative"),
    action: yup.string().required("Action is required !"),
    comments: yup.string().when("action", {
      is: (action) => action === "Rejected" || action === "SAR",
      then: (schema) => schema.required("Comments are required"),
      otherwise: (schema) => schema.notRequired(),
    }),
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
  };

  const validationSchema = useMemo(() => {
    return selectedAuditMode === "manual_audit"
      ? yup.object({ ...baseSchema, ...manualAuditSchema })
      : yup.object(baseSchema);
  }, [selectedAuditMode]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      chart_uid: currentChartId || "",
      error_fields: [],
      audit_type: "traditional",
      chart_qa_score: "",
      dx_qa_score: "",
      original_code_found: "",
      total_errors: "",
      dx_codes_error: 0,
      admin_error: 0,
      codes_added: 0,
      codes_deleted: 0,
      dx_codes_updated: 0,
      dos_corrected: 0,
      pos_corrected: 0,
      dx_level_comment_code_corrected: 0,
      rendering_provider_corrected: 0,
      // common
      primary_chart_uid: "",
      primary_error_status: "no",
      coder_name: "",
      err_field_signature: 0,
      err_field_comment: 0,
      coding_complete_date: "",
      audit_complete_date: format(new Date(), "yyyy-MM-dd"),
      total_pages: "",
      audit_comment: "No Errors, Great Job!!!",
      audit_mode: selectedAuditMode,

      ...(selectedAuditMode === "manual_audit"
        ? {
            project_id: anthem_project_id,
            sub_project_id: "",
            member_name: "",
            dos: "",
            icd: "",
            pages: "",
            dob: "",
            no_of_dx_found_in_extractor: "",
            project_type: "",
            comments: "",
            action: "",
            error_fields: [],
          }
        : {}),
    },
    validationSchema,
    validateOnChange: true,
    onSubmit: async (values, { resetForm }) => {
      await mutation.mutateAsync(values);
      setCurrentChartId("");
      resetForm();
    },
  });

  const endpoint =
    selectedAuditMode === "manual_audit"
      ? "auditors/manual-charts"
      : "auditors/charts";
  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(`${endpoint}`, values, { componentName: "addcharts" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["charts"]);
      formik.resetForm();
      setChartDetails(null);
      setSelectedAuditMode("default_audit");
      setErrorStatus("no");
      setShowFields(false);
      formik.setFieldValue("primary_error_status", "no");

      if (errorStatus === "no") {
        formik.setErrors("audit_comment", "No Errors, Great Job!!!");
      }
    },

    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  useEffect(() => {
    const id = currentChartId || ""; // fallback in case undefined
    if (id.length === 36) {
      setShowSearch(true); // exactly 9 characters → enable
    } else {
      setShowSearch(false); // empty or <9 characters → disable
    }
  }, [currentChartId]);
  // Calculation for Admin Errors Starts
  useEffect(() => {
    if (
      formik.values.dos_corrected ||
      formik.values.rendering_provider_corrected ||
      formik.values.pos_corrected ||
      formik.values.dx_level_comment_code_corrected ||
      formik.values.err_field_signature ||
      formik.values.err_field_comment
    ) {
      let totalAdminErrors =
        Number(formik.values.dos_corrected) +
        Number(formik.values.pos_corrected) +
        Number(formik.values.dx_level_comment_code_corrected) +
        Number(formik.values.err_field_signature) +
        Number(formik.values.err_field_comment) +
        Number(formik.values.rendering_provider_corrected);
      // if (!isLHPProject) {
      formik.setFieldValue("admin_error", totalAdminErrors);
      // }
    }
  }, [
    formik.values.dos_corrected,
    formik.values.rendering_provider_corrected,
    formik.values.pos_corrected,
    formik.values.dx_level_comment_code_corrected,
    formik.values.err_field_signature,
    formik.values.err_field_comment,
  ]);
  // Calculation for Admin Errors Ends

  // Calculation for DX codes Error Starts
  useEffect(() => {
    if (
      formik.values.codes_added ||
      formik.values.codes_deleted ||
      formik.values.dx_codes_updated
    ) {
      let totalErrors =
        Number(formik.values.codes_added) +
        Number(formik.values.codes_deleted) +
        Number(formik.values.dx_codes_updated);
      // if (!isLHPProject) {
      formik.setFieldValue("dx_codes_error", totalErrors);
      // }
    }
  }, [
    formik.values.codes_added,
    formik.values.dx_codes_updated,
    formik.values.codes_deleted,
  ]);
  // Calculation for DX codes Error Ends

  // Calculation for Chart QA Score Starts
  useEffect(() => {
    if (
      formik.values.dx_codes_error ||
      formik.values.admin_error ||
      formik.values.original_code_found
    ) {
      let totalAbsoluteErrors =
        Number(formik.values.dx_codes_error) +
        Number(formik.values.admin_error);

      formik.setFieldValue("total_errors", totalAbsoluteErrors);

      let dividedValue =
        totalAbsoluteErrors / Number(formik.values.original_code_found);

      let finalValue = 100 - dividedValue * 100;

      if (Number.isNaN(finalValue)) {
        formik.setFieldValue("chart_qa_score", 100);
      } else {
        if (finalValue === Number.NEGATIVE_INFINITY) {
          formik.setFieldValue("chart_qa_score", 100);
        } else {
          formik.setFieldValue("chart_qa_score", finalValue);
        }
      }
    }
  }, [
    formik.values.dx_codes_error,
    formik.values.admin_error,
    formik.values.original_code_found,
  ]);
  // Calculation for Chart QA Score Ends

  // Calculation for DX QA Score Starts
  useEffect(() => {
    if (
      formik.values.dx_codes_updated ||
      formik.values.codes_deleted ||
      formik.values.original_code_found ||
      formik.values.codes_added
    ) {
      let value1 =
        Number(formik.values.original_code_found) -
        Number(formik.values.codes_deleted) -
        Number(formik.values.dx_codes_updated);
      let value2 =
        Number(formik.values.original_code_found) +
        Number(formik.values.codes_added);

      let finalValueForDX = (value1 / value2) * 100;
      if (Number.isNaN(finalValueForDX)) {
        formik.setFieldValue("dx_qa_score", 100);
      } else {
        if (finalValueForDX === Number.NEGATIVE_INFINITY) {
          formik.setFieldValue("dx_qa_score", 100);
        } else {
          formik.setFieldValue("dx_qa_score", finalValueForDX);
        }
      }
    }
  }, [
    formik.values.dx_codes_updated,
    formik.values.codes_deleted,
    formik.values.original_code_found,
    formik.values.codes_added,
  ]);
  // Calculation for DX QA Score Ends

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
  }, [errorStatus, selectedAuditMode]);

  // Add new error fields
  const addErrorFields = (e) => {
    e.preventDefault();
    formik.setFieldValue("primary_error_status", "yes");
    const newField = [
      {
        err_status: "",
        type: "",
        dx_comment: "",
        comment_2: "",
        comment_2_count: "",
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

  // Calculate codes added, deleted and updated. Based on selected values of dynamic fields
  useEffect(() => {
    const errFieldsArr = formik.values.error_fields;
    let addedCount = 0;
    let deletedCount = 0;
    let updatedCount = 0;
    let dosCorrected = 0;
    let rpCorrected = 0;
    let signatureCount = 0;
    let commentCount = 0;

    errFieldsArr?.forEach((field) => {
      const errStatus = field.err_status;
      const errComment2 = field.comment_2;
      const errComment2Count = Number(field.comment_2_count);
      const manualErrorCount = Number(field.manual_error_count) || 0;

      if (errStatus === "added") {
        addedCount += manualErrorCount;
      }
      if (errStatus === "deleted") {
        deletedCount += manualErrorCount;
      }
      if (errStatus === "updated") {
        updatedCount += manualErrorCount;
      }
      if (errStatus === "admin") {
        if (errComment2 === "RP") {
          rpCorrected = errComment2Count;
          setisErrFieldRpActive(true);
        }
        if (errComment2 === "DOS") {
          dosCorrected = errComment2Count;
          setisErrFieldDosActive(true);
        }
        if (errComment2 === "Comment") {
          commentCount = errComment2Count;
          setisErrFieldCommentActive(true);
        }
        if (errComment2 === "Signature") {
          signatureCount = errComment2Count;
          setisErrFieldSignatureActive(true);
        }
      }
    });
    formik.setFieldValue("codes_added", addedCount);
    formik.setFieldValue("dx_codes_updated", updatedCount);
    formik.setFieldValue("dos_corrected", dosCorrected);
    formik.setFieldValue("err_field_comment", commentCount);
    formik.setFieldValue("err_field_signature", signatureCount);
    formik.setFieldValue("rendering_provider_corrected", rpCorrected);
    formik.setFieldValue("codes_deleted", deletedCount);
  }, [formik.values.error_fields]);

  // Calculate CPT QA Score
  useEffect(() => {
    if (formik.values.cpt_codes && formik.values.cpt_errors) {
      let finalValue =
        100 -
        (Number(formik.values.cpt_errors) / Number(formik.values.cpt_codes)) *
          100;
      formik.setFieldValue("cpt_qa_score", finalValue);
    }
  }, [formik.values.cpt_codes, formik.values.cpt_errors]);

  // Calculate ICD QA Score
  useEffect(() => {
    if (formik.values.icd_codes && formik.values.icd_errors) {
      let finalValue =
        100 -
        (Number(formik.values.icd_errors) / Number(formik.values.icd_codes)) *
          100;
      formik.setFieldValue("icd_qa_score", finalValue);
    }
  }, [formik.values.icd_codes, formik.values.icd_errors]);

  // Bind default attributes from coder chart id chart exist
  useEffect(() => {
    if (selectedAuditMode === "manual_audit" || !chartDetails) {
      // Manual audit (or no chartDetails available)
      formik.setFieldValue("total_pages", formik.values.pages || "");
      formik.setFieldValue(
        "coding_complete_date",
        format(new Date(), "yyyy-MM-dd") // current date
      );
      formik.setFieldValue("audit_mode", "manual_audit");
    } else if (chartDetails) {
      // Non-manual audit with chartDetails
      formik.setFieldValue("coder_name", chartDetails.user.name);
      formik.setFieldValue("original_code_found", chartDetails.icd);
      formik.setFieldValue("total_pages", chartDetails.pages);
      formik.setFieldValue(
        "coding_complete_date",
        format(new Date(chartDetails.created_at), "yyyy-MM-dd")
      );
    }
  }, [chartDetails, selectedAuditMode, formik.values.pages]);
  const auditModeValue = () => {
    setSelectedAuditMode("manual_audit");
    setShowFields(true);
  };

  const fetchChartDetails = async (chartId) => {
    if (!chartId) {
      formik.setErrors({ chart_uid: "Chart Id is required." });
      return;
    }

    try {
      const response = await apiClient.get(
        `auditors/validate/chart-data/${chartId}`,
        {
          validateStatus: () => true,
        }
      );

      const { status, message, data: chartData } = response.data;

      if (status === "success" && chartData) {
        setShowFields(true);
        setShowCanvas(true);
        setChartDetails(chartData);
        setSelectedAuditMode("default_audit");
        formik.setFieldValue("primary_chart_uid", chartData.id);
        formik.setErrors({});
        formik.setTouched({}, false);
        toast.success(
          response.data.message || "Chart data loaded successfully."
        );
      } else if (message === "Invalid Chart ID") {
        setShowConfirmManualAudit(true); // only for invalid chart ID
        toast.error(message);
        formik.setErrors({ chart_uid: message });
      } else if (message) {
        toast.error(message);
        formik.setErrors({ chart_uid: message });
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };

  const dropdownEndpoints = {
    project_id: "projects/dropdown/coder-project",
    sub_project_id: `sub-projects/dropdown/${anthem_project_id}`,
  };
  const dropdownFields = [
    // { name: "project_id", label: "Project", isMulti: false, isMandatory: true },
    {
      name: "sub_project_id",
      label: "Sub-Project",
      isMulti: false,
      isMandatory: true,
    },
  ];

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(dropdownEndpoints[key], key, optionSearchQuery);
    return acc;
  }, {});

  const handleInputChange = useDebouncedCallback((e, dropdownName) => {
    setOptionSearchQuery(e);
    setSearchQueries((prev) => ({
      ...prev,
      [dropdownName]: e,
    }));
    if (dropdownName === "project_id") {
      setSelectedProjectId(e);
    }
  }, 500);

  const SelectAuditTypeOptionList = [
    { label: "traditional", value: "traditional" },
    { label: "traditional_lookback", value: "traditional_lookback" },
    { label: "lookback", value: "lookback" },
    // { label: "Manual", value: "manual" },
  ];

  const SelectErrorList = [
    { value: "added", label: "Added" },
    { value: "deleted", label: "Deleted" },
    { value: "updated", label: "Updated" },
    { value: "admin", label: "Admin" },
  ];

  const SelectTypeList = [
    { value: "Conceptual", label: "Conceptual" },
    { value: "Negligence", label: "Negligence" },
  ];
  const SelectTypeOptionList = [
    { label: "HCC", value: "HCC" },
    { label: "No HCC", value: "No HCC" },
  ];
  const SelectStatusOptionList = [
    { value: "Code Completed", label: "Code Completed" },
    { value: "Rejected", label: "Rejected" },
    { value: "SAR", label: "SAR" },
  ];
  // const staticDropdowns = [
  //   {
  //     name: "audit_type",
  //     label: "Select Audit Type",
  //     options: SelectAuditTypeOptionList,
  //     isMulti: false,
  //     isMandatory: true,
  //   },
  //   {
  //     name: "project_type",
  //     label: "Select Type",
  //     options: SelectTypeOptionList,
  //     isMulti: false,
  //     isMandatory: true,
  //   },
  // ];
  const staticDropdowns = [
    {
      name: "audit_type",
      label: "Select Audit Type",
      options: SelectAuditTypeOptionList,
      isMulti: false,
      isMandatory: true,
    },
    ...(selectedAuditMode === "manual_audit"
      ? [
          {
            name: "project_type",
            label: "Select Type",
            options: SelectTypeOptionList,
            isMulti: false,
            isMandatory: true,
          },
        ]
      : []),
  ];
  const staticStatus = [
    {
      name: "action",
      label: "Select Status",
      options: SelectStatusOptionList,
      isMulti: false,
      isMandatory: true,
    },
  ];
  const Selectcomment_2List = [
    { value: "Acute", label: "Acute" },
    { value: "Chronic", label: "Chronic" },
    { value: "RP", label: "RP" },
    { value: "DOS", label: "DOS" },
    { value: "Comment", label: "Comment" },
    { value: "Signature", label: "Signature" },
  ];

  const Selectcomment_3List = [
    { value: "From HPI", label: "From HPI" },
    { value: "From PMH", label: "From PMH" },
    { value: "From PL", label: "From PL" },
    { value: "From ROS", label: "From ROS" },
    { value: "From Surgical History", label: "From Surgical History" },
    { value: "From PE", label: "From PE" },
    { value: "From Assessment", label: "From Assessment" },
    { value: "From Plan", label: "From Plan" },
    { value: "From Medication List", label: "From Medication List" },
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

  const staticComment2Dropdowns = [
    {
      name: "comment_2",
      options: Selectcomment_2List,
      isMulti: false,
      isMandatory: true,
    },
  ];
  const staticComment3Dropdowns = [
    {
      name: "comment_2",
      options: Selectcomment_3List,
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
              {chartDetails.chart_uid ?? ""}
              <FaArrowRight className="ms-2" />
            </button>
          </div>
        )}
      </div>

      <div className="card-body ">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-end justify-content-start gy-2 px-2">
            {/* ChartID Section */}
            <div className="col-lg-4 px-1">
              <label htmlFor="ChartID" className="form-label required">
                Chart ID
              </label>
              <div className="d-flex">
                <input
                  type="text"
                  className={`form-control font-size13 custom-inputborder  ${
                    formik.touched.chart_uid &&
                    formik.errors.chart_uid &&
                    "is-invalid"
                  }`}
                  id="ChartID"
                  name="chart_uid"
                  maxLength={36}
                  // onChange={formik.handleChange}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldTouched("chart_uid", true, false);
                    setCurrentChartId(e.target.value);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.chart_uid}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchChartDetails(formik.values.chart_uid.trim());
                      setCurrentChartId(formik.values.chart_uid.trim());
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    let pastedValue = e.clipboardData.getData("text").trim();
                    formik.setFieldValue("chart_uid", pastedValue);
                    setCurrentChartId(pastedValue);

                    formik.setFieldTouched("chart_uid", true);

                    formik.validateField("chart_uid");
                  }}
                />
                <button
                  className="btn btn-primary custom-primary-btn outline-none border-0 ms-2"
                  type="button"
                  id="button-addon2"
                  disabled={!showsearch}
                  onClick={() =>
                    fetchChartDetails(formik.values.chart_uid.trim())
                  }
                >
                  <FaSearch className="" />
                </button>
              </div>

              {formik.touched.chart_uid && formik.errors.chart_uid ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.chart_uid}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            {!showFields ? (
              ""
            ) : (
              <>
                {selectedAuditMode === "manual_audit" && (
                  <>
                    <div className="col-lg-2 px-1">
                      <label
                        htmlFor="audit_mode"
                        className="form-label required"
                      >
                        Audit Mode
                      </label>
                      <input
                        type="text"
                        className={`form-control font-size13   ${
                          formik.touched.audit_mode &&
                          formik.errors.audit_mode &&
                          "is-invalid"
                        }`}
                        id="audit_mode"
                        name="audit_mode"
                        value="Manual Audit"
                        disabled
                        readOnly
                      />
                      {formik.touched.audit_mode && formik.errors.audit_mode ? (
                        <div id="role" className="invalid-feedback">
                          {formik.errors.audit_mode}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedAuditMode === "manual_audit" && (
                  <>
                    {/* Project Section*/}
                    <div className="col-lg-2 px-1">
                      <label htmlFor="project" className="form-label required">
                        Project
                      </label>
                      <div className="d-flex">
                        <input
                          type="text"
                          className={`form-control font-size13  ${
                            formik.touched.project_id &&
                            formik.errors.project_id &&
                            "is-invalid"
                          }`}
                          id="project"
                          name="project_id"
                          placeholder="Enter Valid Chase ID"
                          onBlur={formik.handleBlur}
                          value={"Anthem Elevance"}
                          disabled
                        />
                      </div>
                      {formik.touched.project_id && formik.errors.project_id ? (
                        <div id="role" className="invalid-feedback">
                          {formik.errors.project_id}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                    {dropdownFields.map(
                      ({ name, label, isMulti, isMandatory }) => {
                        const {
                          data,
                          fetchNextPage,
                          hasNextPage,
                          isFetchingNextPage,
                        } = dropdowns[name];
                        const options =
                          data?.pages?.reduce(
                            (acc, page) => [...acc, ...page.data],
                            []
                          ) || [];

                        return (
                          <div className="col-lg-2 px-1" key={name}>
                            <label
                              htmlFor={name}
                              className={`form-label ${
                                isMandatory === true ? "required" : ""
                              }`}
                            >
                              {label}
                            </label>
                            <Select
                              // styles={customStyles(theme)}
                              classNamePrefix="custom-select"
                              className={`font-size13 ${
                                formik.touched[name] &&
                                formik.errors[name] &&
                                "is-invalid"
                              }`}
                              // classNamePrefix="select"
                              isMulti={isMulti}
                              isSearchable
                              name={name}
                              options={options}
                              value={
                                isMulti
                                  ? options.filter((option) =>
                                      formik.values[name]?.includes(
                                        option.value
                                      )
                                    )
                                  : options.find(
                                      (option) =>
                                        option.value === formik.values[name]
                                    ) || null
                              }
                              onMenuScrollToBottom={() => {
                                if (hasNextPage && !isFetchingNextPage) {
                                  fetchNextPage();
                                }
                              }}
                              onInputChange={handleInputChange}
                              onChange={(selectedOption) => {
                                // formik.setFieldValue(name, value);
                                //   formik.setFieldValue(
                                //     name,
                                //     isMulti
                                //       ? selectedOption.map((opt) => opt.value)
                                //       : selectedOption?.value || ""
                                //   );
                                const value = isMulti
                                  ? selectedOption.map((opt) => opt.value)
                                  : selectedOption?.value || "";
                                formik.setFieldValue(name, value);
                                if (name === "project_id") {
                                  setSelectedProjectId(value);
                                }
                              }}
                              onBlur={() => formik.setFieldTouched(name, true)}
                            />
                            {formik.touched[name] && formik.errors[name] ? (
                              <div className="invalid-feedback">
                                {formik.errors[name]}
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
                    {/* DOB Section */}
                    <div className="col-lg-2 px-1">
                      <label htmlFor="DOB" className="form-label required">
                        D.O.B (YYYY-MM-DD)
                      </label>
                      <DatePicker
                        className={`form-control font-size13 darkcard ${
                          formik.touched.dob && formik.errors.dob
                            ? "is-invalid"
                            : ""
                        }`}
                        selected={
                          formik.values.dob
                            ? parse(formik.values.dob, "yyyy-MM-dd", new Date())
                            : null
                        }
                        onChange={(date) => {
                          const formattedDate = date
                            ? format(date, "yyyy-MM-dd")
                            : "";
                          formik.setFieldValue("dob", formattedDate);
                        }}
                        onBlur={() => formik.setFieldTouched("dob", true)}
                        maxDate={
                          new Date(new Date().setDate(new Date().getDate() - 1))
                        }
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select date"
                        showYearDropdown
                        dropdownMode="select"
                        isClearable
                      />
                      {formik.touched.dob && formik.errors.dob ? (
                        <div className="invalid-feedback">
                          {formik.errors.dob}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>

                    {/* MemberName Section */}
                    <div className="col-lg-2 px-1">
                      <label
                        htmlFor="MemberName"
                        className="form-label required"
                      >
                        Member Name
                      </label>
                      <input
                        type="text"
                        className={`form-control font-size13 custom-inputborder  ${
                          formik.touched.member_name &&
                          formik.errors.member_name
                            ? "is-invalid"
                            : ""
                        }`}
                        id="MemberName"
                        placeholder="Enter Member Name"
                        name="member_name"
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldTouched("member_name", true, false);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.member_name}
                      />
                      {formik.touched.member_name &&
                      formik.errors.member_name ? (
                        <div className="invalid-feedback">
                          {formik.errors.member_name}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                    {/* DOS Section */}
                    <div className="col-lg-2 px-1">
                      <label htmlFor="DOS" className="form-label required">
                        Total DOS
                      </label>
                      <input
                        type="text"
                        className={`form-control font-size13 custom-inputborder  ${
                          formik.touched.dos &&
                          formik.errors.dos &&
                          "is-invalid"
                        }`}
                        id="DOS"
                        placeholder="Enter DOS"
                        name="dos"
                        maxLength={4}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldTouched("dos", true, false);
                        }}
                        value={formik.values.dos}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedValue = e.clipboardData
                            .getData("text")
                            .trim();
                          formik.setFieldValue("dos", pastedValue);
                        }}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.dos && formik.errors.dos ? (
                        <div id="role" className="invalid-feedback">
                          {formik.errors.dos}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                    {/* ICD Section */}
                    <div className="col-lg-2 px-1">
                      <label htmlFor="icd" className="form-label required">
                        Total ICD
                      </label>
                      <input
                        type="text"
                        className={`form-control font-size13 custom-inputborder  ${
                          formik.touched.icd &&
                          formik.errors.icd &&
                          "is-invalid"
                        }`}
                        id="ICD"
                        placeholder="Enter ICD"
                        name="icd"
                        maxLength={4}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldTouched("icd", true, false);
                        }}
                        value={formik.values.icd}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedValue = e.clipboardData
                            .getData("text")
                            .trim();
                          formik.setFieldValue("icd", pastedValue);
                        }}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.icd && formik.errors.icd ? (
                        <div id="role" className="invalid-feedback">
                          {formik.errors.icd}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                    {/* Total Pages Section */}
                    <div className="col-lg-2 px-1">
                      <label htmlFor="Pages" className="form-label required">
                        Total Pages
                      </label>
                      <input
                        type="text"
                        className={`form-control font-size13 custom-inputborder  ${
                          formik.touched.pages &&
                          formik.errors.pages &&
                          "is-invalid"
                        }`}
                        id="pages"
                        placeholder="Enter Pages"
                        name="pages"
                        maxLength={4}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldTouched("pages", true, false);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.pages}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedValue = e.clipboardData
                            .getData("text")
                            .trim();
                          formik.setFieldValue("pages", pastedValue);
                        }}
                      />
                      {formik.touched.pages && formik.errors.pages ? (
                        <div id="role" className="invalid-feedback">
                          {formik.errors.pages}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                    {/*no_of_dx_found_in_extractor Section */}
                    <div className="col-lg-2 px-1">
                      <label htmlFor="Pages" className="form-label required">
                        DX Found In Extractor
                      </label>
                      <input
                        type="text"
                        className={`form-control font-size13 custom-inputborder  ${
                          formik.touched.no_of_dx_found_in_extractor &&
                          formik.errors.no_of_dx_found_in_extractor &&
                          "is-invalid"
                        }`}
                        id="no_of_dx_found_in_extractor"
                        placeholder="Enter no of dx found in extractor"
                        name="no_of_dx_found_in_extractor"
                        maxLength={4}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldTouched(
                            "no_of_dx_found_in_extractor",
                            true,
                            false
                          );
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.no_of_dx_found_in_extractor}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedValue = e.clipboardData
                            .getData("text")
                            .trim();
                          formik.setFieldValue(
                            "no_of_dx_found_in_extractor",
                            pastedValue
                          );
                        }}
                      />
                      {formik.touched.no_of_dx_found_in_extractor &&
                      formik.errors.no_of_dx_found_in_extractor ? (
                        <div id="role" className="invalid-feedback">
                          {formik.errors.no_of_dx_found_in_extractor}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                    {/* Status Section */}
                    {staticStatus.map(
                      ({ name, label, options, isMulti, isMandatory }) => (
                        <div className="col-lg-2 px-1" key={name}>
                          <label
                            htmlFor={name}
                            className={`form-label ${isMandatory ? "required" : ""}`}
                          >
                            {label}
                          </label>

                          <Select
                            // styles={customStyles(theme)}
                            classNamePrefix="custom-select"
                            className={`font-size13 required ${
                              formik.touched[name] &&
                              formik.errors[name] &&
                              "is-invalid"
                            }`}
                            // classNamePrefix="select"
                            isMulti={isMulti}
                            isSearchable
                            name={name}
                            options={options}
                            value={
                              isMulti
                                ? options.filter((option) =>
                                    formik.values[name]?.includes(option.value)
                                  )
                                : options.find(
                                    (option) =>
                                      option.value === formik.values[name]
                                  ) || null
                            }
                            onChange={(selectedOption) => {
                              formik.setFieldValue(
                                name,
                                isMulti
                                  ? selectedOption.map((opt) => opt.value)
                                  : selectedOption?.value || ""
                              );
                            }}
                            onBlur={() => formik.setFieldTouched(name, true)}
                          />

                          {formik.touched[name] && formik.errors[name] ? (
                            <div className="invalid-feedback">
                              {formik.errors[name]}
                            </div>
                          ) : (
                            <div className="invisible">
                              <span>invisible</span>
                            </div>
                          )}
                        </div>
                      )
                    )}
                    {/* Comments Section */}
                    <div className="col-lg-2 px-1">
                      <label
                        htmlFor="Comments"
                        className="form-label comments_label required"
                      >
                        Comments
                      </label>
                      <textarea
                        className={`form-control font-size13 custom-inputborder darkcard ${
                          formik.touched.comments &&
                          formik.errors.comments &&
                          "is-invalid"
                        }`}
                        id="Comments"
                        placeholder="Enter Comments"
                        name="comments"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.comments}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedValue = e.clipboardData
                            .getData("text")
                            .trim();
                          formik.setFieldValue("comments", pastedValue);
                        }}
                      />
                      {formik.touched.comments && formik.errors.comments ? (
                        <div id="role" className="invalid-feedback">
                          {formik.errors.comments}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {/* Audit Type Section */}
                {staticDropdowns.map(
                  ({ name, label, options, isMulti, isMandatory }) => (
                    <div className="col-lg-2 px-1" key={name}>
                      <label
                        id=""
                        htmlFor={name}
                        className={`form-label  ${isMandatory ? "required" : ""}`}
                      >
                        {label}
                      </label>

                      <Select
                        // styles={customStyles(theme)}
                        classNamePrefix="custom-select"
                        className={`font-size13 ${
                          formik.touched[name] &&
                          formik.errors[name] &&
                          "is-invalid"
                        }`}
                        // classNamePrefix="select"
                        isMulti={isMulti}
                        isSearchable
                        name={name}
                        options={options}
                        value={
                          isMulti
                            ? options.filter((option) =>
                                formik.values[name]?.includes(option.value)
                              )
                            : options.find(
                                (option) => option.value === formik.values[name]
                              ) || null
                        }
                        onChange={(selectedOption) => {
                          formik.setFieldValue(
                            name,
                            isMulti
                              ? selectedOption.map((opt) => opt.value)
                              : selectedOption?.value || ""
                          );
                        }}
                        onBlur={() => formik.setFieldTouched(name, true)}
                      />

                      {formik.touched[name] && formik.errors[name] ? (
                        <div className="invalid-feedback">
                          {formik.errors[name]}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                  )
                )}
                {/* AuditCompleteDate Section */}
                <div className="col-lg-2 px-1">
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
                        formik.setFieldValue(
                          "audit_complete_date",
                          formattedDate
                        );
                      }}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  {formik.touched.audit_complete_date &&
                  formik.errors.audit_complete_date ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.audit_complete_date}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* OriginalCodeFound Section */}
                <div className="col-lg-2 px-1 ">
                  <label
                    htmlFor="OriginalCodeFound"
                    className="form-label required"
                  >
                    Original Code Found
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    className={`form-control font-size13 custom-inputborder  ${
                      formik.touched.original_code_found &&
                      formik.errors.original_code_found &&
                      "is-invalid"
                    }`}
                    id="OriginalCodeFound"
                    // placeholder="Enter OriginalCodeFound"
                    name="original_code_found"
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldTouched(
                        "original_code_found",
                        true,
                        false
                      );
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.original_code_found}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("original_code_found", pastedValue);
                    }}
                  />
                  {formik.touched.original_code_found &&
                  formik.errors.original_code_found ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.original_code_found}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* DosCorrected Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor="DosCorrected" className="form-label required">
                    Dos Corrected
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13   ${
                      formik.touched.dos_corrected &&
                      formik.errors.dos_corrected &&
                      "is-invalid"
                    }`}
                    id="DosCorrected"
                    // placeholder="Enter DosCorrected"
                    disabled
                    name="dos_corrected"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dos_corrected}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("dos_corrected", pastedValue);
                    }}
                  />
                  {formik.touched.dos_corrected &&
                  formik.errors.dos_corrected ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.dos_corrected}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* Rendering Provider Corrected Section */}
                <div className="col-lg-2 px-1">
                  <label
                    htmlFor="RenderingProviderCorrected"
                    className="form-label required"
                  >
                    Rendering Provider Corrected
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13  ${
                      formik.touched.rendering_provider_corrected &&
                      formik.errors.rendering_provider_corrected &&
                      "is-invalid"
                    }`}
                    id="RenderingProviderCorrected"
                    // placeholder="Enter RenderingProviderCorrected"
                    disabled
                    name="rendering_provider_corrected"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.rendering_provider_corrected}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue(
                        "rendering_provider_corrected",
                        pastedValue
                      );
                    }}
                  />
                  {formik.touched.rendering_provider_corrected &&
                  formik.errors.rendering_provider_corrected ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.rendering_provider_corrected}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* Dx level comment code corrected Section */}
                <div className="col-lg-2 px-1">
                  <label
                    htmlFor="Dxlevelcommentcodecorrected"
                    className="form-label required"
                  >
                    Dx level comment code corrected
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13 custom-inputborder  ${
                      formik.touched.dx_level_comment_code_corrected &&
                      formik.errors.dx_level_comment_code_corrected &&
                      "is-invalid"
                    }`}
                    id="Dxlevelcommentcodecorrected"
                    // placeholder="Enter Dxlevelcommentcodecorrected"
                    name="dx_level_comment_code_corrected"
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldTouched(
                        "dx_level_comment_code_corrected",
                        true,
                        false
                      );
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.dx_level_comment_code_corrected}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue(
                        "dx_level_comment_code_corrected",
                        pastedValue
                      );
                    }}
                  />
                  {formik.touched.dx_level_comment_code_corrected &&
                  formik.errors.dx_level_comment_code_corrected ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.dx_level_comment_code_corrected}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* POS Corrected Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor="POSCorrected" className="form-label required">
                    POS Corrected
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13 custom-inputborder  ${
                      formik.touched.pos_corrected &&
                      formik.errors.pos_corrected &&
                      "is-invalid"
                    }`}
                    id="POSCorrected"
                    name="pos_corrected"
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldTouched("pos_corrected", true, false);
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.pos_corrected}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("pos_corrected", pastedValue);
                    }}
                  />
                  {formik.touched.pos_corrected &&
                  formik.errors.pos_corrected ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.pos_corrected}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* Codes Added Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor=" CodesAdded" className="form-label required">
                    Codes Added
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13   ${
                      formik.touched.codes_added &&
                      formik.errors.codes_added &&
                      "is-invalid"
                    }`}
                    id="CodesAdded"
                    // placeholder="Enter Codes Added"
                    name="codes_added"
                    disabled
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.codes_added}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("codes_added", pastedValue);
                    }}
                  />
                  {formik.touched.codes_added && formik.errors.codes_added ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.codes_added}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* Codes Deleted Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor=" CodesAdded" className="form-label required">
                    Codes Deleted
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13   ${
                      formik.touched.codes_deleted &&
                      formik.errors.codes_deleted &&
                      "is-invalid"
                    }`}
                    id="CodesDeleted"
                    // placeholder="Enter Codes Deleted"
                    name="codes_deleted"
                    disabled
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.codes_deleted}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("codes_deleted", pastedValue);
                    }}
                  />
                  {formik.touched.codes_deleted &&
                  formik.errors.codes_deleted ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.codes_deleted}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* DX Codes Updated Section */}
                <div className="col-lg-2 px-1">
                  <label
                    htmlFor=" DXCodesUpdated"
                    className="form-label required"
                  >
                    DX Codes Updated
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13   ${
                      formik.touched.dx_codes_updated &&
                      formik.errors.dx_codes_updated &&
                      "is-invalid"
                    }`}
                    id="DXCodesUpdated"
                    // placeholder="Enter DX Codes Updated"
                    name="dx_codes_updated"
                    disabled
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dx_codes_updated}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("dx_codes_updated", pastedValue);
                    }}
                  />
                  {formik.touched.dx_codes_updated &&
                  formik.errors.dx_codes_updated ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.dx_codes_updated}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/*  No Of DX Codes Error Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor=" NoOfDXCodesError" className="form-label">
                    No Of DX Codes Error
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13   ${
                      formik.touched.dx_codes_error &&
                      formik.errors.dx_codes_error &&
                      "is-invalid"
                    }`}
                    id="NoOfDXCodesError"
                    // placeholder="Enter No Of DX Codes Error"
                    name="dx_codes_error"
                    disabled
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dx_codes_error}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("dx_codes_error", pastedValue);
                    }}
                  />
                  {formik.touched.dx_codes_error &&
                  formik.errors.dx_codes_error ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.dx_codes_error}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/* No of Admin Error Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor=" NoofAdminError" className="form-label">
                    No of Admin Error
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13  ${
                      formik.touched.admin_error &&
                      formik.errors.admin_error &&
                      "is-invalid"
                    }`}
                    id="NoofAdminError"
                    // placeholder="Enter No of Admin Error"
                    name="admin_error"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled
                    value={formik.values.admin_error}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("admin_error", pastedValue);
                    }}
                  />
                  {formik.touched.admin_error && formik.errors.admin_error ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.admin_error}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/*  Total Absolute Errors Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor=" TotalAbsoluteErrors" className="form-label">
                    Total Absolute Errors
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13   ${
                      formik.touched.total_errors &&
                      formik.errors.total_errors &&
                      "is-invalid"
                    }`}
                    id="TotalAbsoluteErrors"
                    // placeholder="Enter Total Absolute Errors"
                    name="total_errors"
                    disabled
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.total_errors}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("total_error", pastedValue);
                    }}
                  />
                  {formik.touched.total_errors && formik.errors.total_errors ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.total_errors}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/*  ChartLevel QA Score Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor=" ChartLevelQAScore" className="form-label">
                    Chart Level QA Score
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13 ${
                      formik.touched.chart_qa_score &&
                      formik.errors.chart_qa_score &&
                      "is-invalid"
                    }`}
                    id="ChartLevelQAScore"
                    // placeholder="Enter ChartLevel QA Score"
                    name="chart_qa_score"
                    disabled
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.chart_qa_score}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("chart_qa_score", pastedValue);
                    }}
                  />
                  {formik.touched.chart_qa_score &&
                  formik.errors.chart_qa_score ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.chart_qa_score}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                {/*  DX Level QA score Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor="DXLevelQAscore" className="form-label ">
                    DX Level QA score
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13  ${
                      formik.touched.dx_qa_score &&
                      formik.errors.dx_qa_score &&
                      "is-invalid"
                    }`}
                    id="DXLevelQAscore"
                    // placeholder="Enter DX Level QAscore"
                    disabled
                    name="dx_qa_score"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dx_qa_score}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedValue = e.clipboardData
                        .getData("text")
                        .trim();
                      formik.setFieldValue("dx_qa_error", pastedValue);
                    }}
                  />
                  {formik.touched.dx_qa_score && formik.errors.dx_qa_score ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.dx_qa_score}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
                <div className="col-lg-2 px-1">
                  {errorStatus === "no" ? (
                    <>
                      <label
                        htmlFor="auditor_comment"
                        className="form-label required"
                      >
                        Auditor comments
                      </label>

                      <input
                        type="text"
                        className="form-control font-size13  "
                        value="No Errors"
                        disabled
                      />
                      <div className="invisible">
                        <span>invisible</span>
                      </div>
                    </>
                  ) : null}
                </div>
                <Offcanvas
                  show={show}
                  onHide={handleClose}
                  placement="end"
                  style={{ width: "40%" }}
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title></Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <div>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <p className="text-custom-color">
                            Chart ID
                            <span className="text-dark h6 ms-3">
                              {formik.values.chart_uid}
                            </span>
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="text-custom-color mb-0">
                            Coder name
                            <span className="text-dark h6 ms-3">
                              {ucFirst(formik.values.coder_name)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <p className="text-custom-color mb-0">Member name</p>
                          <span className="text-data-color h6">
                            {ucFirst(chartDetails && chartDetails?.member_name)}
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
                            {chartDetails &&
                              chartDetails?.coding_at.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <p className="text-custom-color mb-0">Total DOS</p>
                          <span className="text-data-color h6">
                            {chartDetails && chartDetails?.dos}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <p className="text-custom-color mb-0">Action</p>
                          <span className="text-data-color h6">
                            {chartDetails && chartDetails?.action}
                          </span>
                        </div>
                      </div>

                      {
                        <div className="row mb-4">
                          <div className="col-6">
                            <p className="text-custom-color mb-0">
                              Coder comment
                            </p>
                            <span className="text-data-color h6">
                              {chartDetails && chartDetails.comments ? (
                                ucFirst(chartDetails.comments)
                              ) : (
                                <span className="text-muted">NA</span>
                              )}
                            </span>
                          </div>
                          <div className="col-6">
                            <p className="text-custom-color mb-0">
                              Project Type
                            </p>
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
                      <div className="row mb-4">
                        <div className="col-md-12">
                          <p className="text-custom-color mb-0">
                            Sub Project Name
                          </p>
                          <span className="text-data-color h6">
                            {ucFirst(
                              chartDetails && chartDetails?.sub_project_name
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Offcanvas.Body>
                </Offcanvas>
                {/* Dynamic error fields */}
                <div className="row   px-lg-2">
                  <div className=" d-flex justify-content-start align-content-center col-lg px-1 mb-2">
                    <label
                      htmlFor="error_check"
                      className="form-label required mt-3"
                    >
                      Need to add error?
                    </label>

                    <div className="d-flex ms-3">
                      <div className="custom-toggle-switch">
                        <span
                          className={`toggle-label ${
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
                              formik.setFieldValue(
                                "primary_error_status",
                                value
                              );
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
                      {formik.touched.error_fields &&
                      formik.errors.error_fields ? (
                        <div
                          id="error_fields"
                          className="invalid-feedback d-block ms-3 mt-2 "
                        >
                          {formik.errors.error_fields}
                        </div>
                      ) : (
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(errorStatus === "yes" && chartDetails) ||
                  (errorStatus === "yes" &&
                    selectedAuditMode === "manual_audit") ? (
                    <>
                      <div className=" d-flex justify-content-end  align-content-center col-lg px-1 mb-2 ">
                        <button
                          className="btn btn-primary custom-primary-btn font-size13 py-2 px-4"
                          onClick={(e) => addErrorFields(e)}
                        >
                          Add Errors
                          <FaPlus className=" ms-1 input-icon" />
                        </button>
                        <div className="invisible">
                          <span>invisible</span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>

                {errorStatus === "yes" && (
                  // <div className="table-responsive" style={{ maxHeight: "300px" }}>
                  <div className="overflow-auto">
                    <table className="table ">
                      <thead className="font-size13">
                        <tr>
                          <th scope="col" className="text-center">
                            S.No
                          </th>
                          <th scope="col">
                            <span className="required">
                              Error Status <span className="requireds">*</span>
                            </span>
                          </th>
                          <th scope="col">
                            <span className="required">
                              Type <span className="requireds">*</span>
                            </span>
                          </th>
                          <th scope="col">
                            <span className="required">
                              Error Count <span className="requireds">*</span>
                            </span>
                          </th>
                          <th scope="col">
                            <span className="required">
                              ICD <span className="requireds">*</span>
                            </span>
                          </th>
                          <th scope="col">
                            <span className="required">
                              Comments for DX
                              <span className="requireds">*</span>
                            </span>
                          </th>
                          <th scope="col">
                            <span className="required">
                              Comments 2 <span className="requireds">*</span>
                            </span>
                          </th>

                          <th scope="col">
                            <span className="required">
                              Comments 3 <span className="requireds">*</span>
                            </span>
                          </th>
                          <th scope="col">
                            <span className="required">
                              Secondary Comments
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
                          formik.values.error_fields.map(
                            (inputFields, index) => (
                              <tr key={index} className="">
                                <td className="text-black border-bottom-0 text-center ">
                                  <div className="invisible">
                                    <span>invisible</span>
                                  </div>
                                  <div className="audit-error">{index + 1}</div>
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
                                      const filedName = `error_fields.${index}.err_status`;

                                      return (
                                        <div
                                          key={name}
                                          className=" w-full pt-4"
                                        >
                                          <Select
                                            classNamePrefix="custom-select"
                                            className={`font-size13 ${
                                              formik.touched?.error_fields?.[
                                                index
                                              ]?.err_status &&
                                              formik.errors?.error_fields?.[
                                                index
                                              ]?.err_status
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                            isMulti={isMulti}
                                            isSearchable
                                            options={options}
                                            name={filedName}
                                            id={`err_status${index}`}
                                            value={
                                              isMulti
                                                ? options.filter((option) =>
                                                    formik.values?.error_fields?.[
                                                      index
                                                    ]?.err_status?.includes(
                                                      option.value
                                                    )
                                                  )
                                                : options.find(
                                                    (option) =>
                                                      option.value ===
                                                      formik.values
                                                        ?.error_fields?.[index]
                                                        ?.err_status
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
                                              formik.setFieldTouched(
                                                filedName,
                                                true
                                              )
                                            }
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                          />

                                          {formik.touched?.error_fields?.[index]
                                            ?.err_status &&
                                          formik.errors?.error_fields?.[index]
                                            ?.err_status ? (
                                            <div className="invalid-feedback">
                                              {
                                                formik.errors.error_fields[
                                                  index
                                                ].err_status
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
                                  {staticTypeDropdowns.map(
                                    ({
                                      name,
                                      label,
                                      options,
                                      isMulti,
                                      isMandatory,
                                    }) => {
                                      const filedName = `error_fields.${index}.type`;

                                      return (
                                        <div key={name} className="w-full pt-4">
                                          <Select
                                            classNamePrefix="custom-select"
                                            className={`font-size13 ${
                                              formik.touched?.error_fields?.[
                                                index
                                              ]?.type &&
                                              formik.errors?.error_fields?.[
                                                index
                                              ]?.type
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                            isMulti={isMulti}
                                            isSearchable
                                            options={options}
                                            name={filedName}
                                            id={`type${index}`}
                                            // value={inputFields.type}
                                            value={
                                              isMulti
                                                ? options.filter((option) =>
                                                    formik.values?.error_fields?.[
                                                      index
                                                    ]?.type?.includes(
                                                      option.value
                                                    )
                                                  )
                                                : options.find(
                                                    (option) =>
                                                      option.value ===
                                                      formik.values
                                                        ?.error_fields?.[index]
                                                        ?.type
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
                                              formik.setFieldTouched(
                                                filedName,
                                                true
                                              )
                                            }
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                          />

                                          {formik.touched?.error_fields?.[index]
                                            ?.type &&
                                          formik.errors?.error_fields?.[index]
                                            ?.type ? (
                                            <div className="invalid-feedback">
                                              {
                                                formik.errors.error_fields[
                                                  index
                                                ].type
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
                                  {inputFields.err_status === "admin" ? (
                                    ""
                                  ) : (
                                    <div className="w-full pt-4">
                                      <input
                                        type="number"
                                        className={`form-control fc-error font-size13 custom-inputborder  ${
                                          formik.touched.error_fields?.[index]
                                            ?.manual_error_count &&
                                          formik.errors.error_fields?.[index]
                                            ?.manual_error_count &&
                                          "is-invalid"
                                        }`}
                                        id="manual_error_count"
                                        placeholder="Enter manual error count"
                                        name={`error_fields.${index}.manual_error_count`}
                                        onChange={(e) => {
                                          const value = e.target.value;

                                          // Allow empty input or numbers <= 999
                                          if (
                                            value === "" ||
                                            Number(value) <= 999
                                          ) {
                                            formik.setFieldValue(
                                              `error_fields.${index}.manual_error_count`,
                                              value === "" ? "" : Number(value)
                                            );
                                          }
                                        }}
                                        onBlur={formik.handleBlur}
                                        value={
                                          formik.values.error_fields?.[index]
                                            ?.manual_error_count
                                        }
                                      />

                                      {formik.touched.manual_error_count &&
                                      formik.errors.manual_error_count ? (
                                        <div
                                          id="role"
                                          className="invalid-feedback"
                                        >
                                          {
                                            formik.errors.error_fields[index]
                                              .manual_error_count
                                          }
                                        </div>
                                      ) : (
                                        <div className="invisible">
                                          <span>invisible</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                <td>
                                  {inputFields.err_status === "admin" ? (
                                    ""
                                  ) : (
                                    <div className="w-full pt-4">
                                      <input
                                        type="text"
                                        className={`form-control fc-error  font-size13 custom-inputborder  ${
                                          formik.touched.icd &&
                                          formik.errors.icd &&
                                          "is-invalid"
                                        }`}
                                        id="icd"
                                        placeholder="Enter ICD"
                                        maxLength={7}
                                        name={`error_fields.${index}.icd`}
                                        onChange={(e) => {
                                          formik.handleChange(e);
                                          formik.setFieldTouched(
                                            "icd",
                                            true,
                                            false
                                          );
                                        }}
                                        onBlur={formik.handleBlur}
                                        value={
                                          formik.values.error_fields[index]?.icd
                                        }
                                        // value={formik.values.icd}
                                        // onPaste={(e) => {
                                        //   e.preventDefault();
                                        //   const pastedValue = e.clipboardData
                                        //     .getData("text")
                                        //     .trim();
                                        //   formik.setFieldValue("icd", pastedValue);
                                        // }}
                                      />
                                      {formik.touched.icd &&
                                      formik.errors.icd ? (
                                        <div
                                          id="role"
                                          className="invalid-feedback"
                                        >
                                          {formik.errors.icd}
                                        </div>
                                      ) : (
                                        <div className="invisible">
                                          <span>invisible</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {inputFields.err_status !== "admin" ? (
                                  <>
                                    <td>
                                      <div className="w-full pt-4">
                                        <textarea
                                          className={` fc-error form-control font-size13 custom-inputborder ${
                                            formik.touched.dx_comment_ &&
                                            formik.errors.dx_comment &&
                                            "is-invalid"
                                          }`}
                                          id={`dx_comment_${index}`}
                                          placeholder="Enter Comments"
                                          name={`error_fields.${index}.dx_comment`}
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                          value={formik.values.dx_comment}
                                          // onPaste={(e) => {
                                          //   e.preventDefault();
                                          //   const pastedValue = e.clipboardData
                                          //     .getData("text")
                                          //     .trim();
                                          //   formik.setFieldValue(
                                          //     "dx_comment",
                                          //     pastedValue
                                          //   );
                                          // }}
                                        />
                                        {formik.touched.dx_comment &&
                                        formik.errors.dx_comment ? (
                                          <div
                                            id="role"
                                            className="invalid-feedback"
                                          >
                                            {formik.errors.dx_comment}
                                          </div>
                                        ) : (
                                          <div className="invisible">
                                            <span>invisible</span>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="border-bottom-0"></td>
                                  </>
                                )}
                                <td>
                                  {staticComment2Dropdowns.map(
                                    ({
                                      name,
                                      label,
                                      options,
                                      isMulti,
                                      isMandatory,
                                    }) => {
                                      const filedName = `error_fields.${index}.comment_2`;
                                      const selectedComment2Values =
                                        formik.values.error_fields.flatMap(
                                          (field, i) => {
                                            if (i === index) return [];
                                            if (field.err_status !== "admin")
                                              return [];
                                            const val = field.comment_2;
                                            if (!val) return [];
                                            return Array.isArray(val)
                                              ? val
                                              : [val];
                                          }
                                        );
                                      const finalOptions =
                                        inputFields.err_status === "admin"
                                          ? options
                                              .filter(
                                                (opt) =>
                                                  opt.label !== "Acute" &&
                                                  opt.label !== "Chronic"
                                              )
                                              .filter(
                                                (opt) =>
                                                  !selectedComment2Values.includes(
                                                    opt.value
                                                  )
                                              )
                                          : options;

                                      return (
                                        <div key={name} className="w-full pt-4">
                                          <Select
                                            classNamePrefix="custom-select"
                                            className={`font-size13 ${
                                              formik.touched?.error_fields?.[
                                                index
                                              ]?.comment_2 &&
                                              formik.errors?.error_fields?.[
                                                index
                                              ]?.comment_2
                                                ? "is-invalid"
                                                : ""
                                            }`}
                                            isMulti={isMulti}
                                            isSearchable
                                            options={finalOptions}
                                            name={filedName}
                                            id="comment_2"
                                            value={
                                              isMulti
                                                ? finalOptions.filter(
                                                    (option) =>
                                                      formik.values?.error_fields?.[
                                                        index
                                                      ]?.comment_2?.includes(
                                                        option.value
                                                      )
                                                  )
                                                : finalOptions.find(
                                                    (option) =>
                                                      option.value ===
                                                      formik.values
                                                        ?.error_fields?.[index]
                                                        ?.comment_2
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
                                              formik.setFieldTouched(
                                                filedName,
                                                true
                                              )
                                            }
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                          />

                                          {formik.touched?.error_fields?.[index]
                                            ?.comment_2 &&
                                          formik.errors?.error_fields?.[index]
                                            ?.comment_2 ? (
                                            <div className="invalid-feedback">
                                              {
                                                formik.errors.error_fields[
                                                  index
                                                ].comment_2
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
                                {inputFields.err_status !== "admin" ? (
                                  <>
                                    <td>
                                      {staticComment3Dropdowns.map(
                                        ({
                                          name,
                                          label,
                                          options,
                                          isMulti,
                                          isMandatory,
                                        }) => {
                                          const filedName = `error_fields.${index}.comment_3`;

                                          return (
                                            <div
                                              key={name}
                                              className="w-full pt-4"
                                            >
                                              <Select
                                                classNamePrefix="custom-select"
                                                className={`font-size13 ${
                                                  formik.touched
                                                    ?.error_fields?.[index]
                                                    ?.comment_3 &&
                                                  formik.errors?.error_fields?.[
                                                    index
                                                  ]?.comment_3
                                                    ? "is-invalid"
                                                    : ""
                                                }`}
                                                isMulti={isMulti}
                                                isSearchable
                                                options={options}
                                                name={filedName}
                                                id="comment_3"
                                                value={
                                                  isMulti
                                                    ? options.filter((option) =>
                                                        formik.values?.error_fields?.[
                                                          index
                                                        ]?.comment_3?.includes(
                                                          option.value
                                                        )
                                                      )
                                                    : options.find(
                                                        (option) =>
                                                          option.value ===
                                                          formik.values
                                                            ?.error_fields?.[
                                                            index
                                                          ]?.comment_3
                                                      ) || null
                                                }
                                                onChange={(selectedOption) => {
                                                  formik.setFieldValue(
                                                    filedName,
                                                    isMulti
                                                      ? selectedOption.map(
                                                          (opt) => opt.value
                                                        )
                                                      : selectedOption?.value ||
                                                          ""
                                                  );
                                                }}
                                                onBlur={() =>
                                                  formik.setFieldTouched(
                                                    filedName,
                                                    true
                                                  )
                                                }
                                                menuPlacement="auto"
                                                menuPosition="fixed"
                                              />

                                              {formik.touched?.error_fields?.[
                                                index
                                              ]?.comment_3 &&
                                              formik.errors?.error_fields?.[
                                                index
                                              ]?.comment_3 ? (
                                                <div className="invalid-feedback">
                                                  {
                                                    formik.errors.error_fields[
                                                      index
                                                    ].comment_3
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
                                  </>
                                ) : (
                                  <td>
                                    <div className="w-full pt-4">
                                      <input
                                        type="number"
                                        className={`form-control fc-error  font-size13 custom-inputborder  ${
                                          formik.touched.comment_2_count &&
                                          formik.errors.comment_2_count &&
                                          "is-invalid"
                                        }`}
                                        id="comment_2_count"
                                        placeholder="Enter Comment Count"
                                        name={`error_fields.${index}.comment_2_count`}
                                        onChange={(e) => {
                                          formik.handleChange(e);
                                          formik.setFieldTouched(
                                            "comment_2_count",
                                            true,
                                            false
                                          );
                                        }}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.comment_2_count}
                                        // onPaste={(e) => {
                                        //   e.preventDefault();
                                        //   const pastedValue = e.clipboardData
                                        //     .getData("text")
                                        //     .trim();
                                        //   formik.setFieldValue(
                                        //     "comment_2_count",
                                        //     pastedValue
                                        //   );
                                        // }}
                                      />
                                      {formik.touched.comment_2_count &&
                                      formik.errors.comment_2_count ? (
                                        <div
                                          id="role"
                                          className="invalid-feedback"
                                        >
                                          {formik.errors.comment_2_count}
                                        </div>
                                      ) : (
                                        <div className="invisible">
                                          <span>invisible</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                )}
                                <td>
                                  <div className="w-full pt-4">
                                    <textarea
                                      className={` fc-error  form-control font-size13 custom-inputborder ${
                                        formik.touched.secondary_comment &&
                                        formik.errors.secondary_comment &&
                                        "is-invalid"
                                      }`}
                                      id={`secondary_comment${index}`}
                                      placeholder="Enter Comments"
                                      name={`error_fields.${index}.secondary_comment`}
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      value={formik.values.secondary_comment}
                                      // onPaste={(e) => {
                                      //   e.preventDefault();
                                      //   const pastedValue = e.clipboardData
                                      //     .getData("text")
                                      //     .trim();
                                      //   formik.setFieldValue(
                                      //     "secondary_comment",
                                      //     pastedValue
                                      //   );
                                      // }}
                                    />
                                    {formik.touched.dx_comment &&
                                    formik.errors.secondary_comment ? (
                                      <div
                                        id="role"
                                        className="invalid-feedback"
                                      >
                                        {formik.errors.secondary_comment}
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
                                        <Tooltip className="text-cap">
                                          Delete
                                        </Tooltip>
                                      }
                                      container={this}
                                      placement="bottom"
                                    >
                                      <button
                                        onClick={(e) =>
                                          removeErrorFields(e, index)
                                        }
                                      >
                                        <RiDeleteBin6Line className="bi-delete" />
                                      </button>
                                    </OverlayTrigger>
                                  </div>
                                  {/* )} */}
                                </td>
                              </tr>
                            )
                          )
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
                <div className="col-lg-2 d-flex justify-content-end pe-4  w-100">
                  <div className="d-flex">
                    <button
                      type="submit"
                      className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center mt-2"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <span>Loading...</span>
                      ) : (
                        "Add Audit"
                      )}
                      <FaArrowRight className="ms-2" />
                    </button>
                  </div>
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
      <ModalComp
        isOpen={showConfirmManualAudit}
        onClose={() => setShowConfirmManualAudit(false)}
        confirmLabel="yes"
        cancelLabel="No"
        confirmAction={auditModeValue}
      >
        <p className="logout-para  mt-3">Chart Id is Invalid</p>
        <p className="logout-para  mt-3">
          Are you want to add this chart as manual audit?
        </p>
      </ModalComp>
    </div>
  );
};

export default AddAnthem;
