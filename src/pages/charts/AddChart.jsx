import { useState, useEffect } from "react";
import { useFormik } from "formik";
import apiClient from "../../services/apiClient";
import * as yup from "yup";
import Select from "react-select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import DropdownOptions from "../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import DatePicker from "react-datepicker";
import { format, parse, parseISO } from "date-fns";
import { FaArrowRight } from "react-icons/fa6";
import { toast } from "react-toastify";
const AddChart = ({ project_id }) => {
  const queryClient = useQueryClient();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [chartStatus, setChartStatus] = useState("");
  const [chartData, setChartData] = useState("");

  const [searchQueries, setSearchQueries] = useState({
    project_id: "",
    sub_project_id: "",
  });

  const dropdownEndpoints = {
    project_id: "projects/dropdown/coder-project",
    sub_project_id: selectedProjectId
      ? `sub-projects/dropdown/${selectedProjectId}`
      : null,
  };
  const dropdownFields = [
    { name: "project_id", label: "Project", isMulti: false, isMandatory: true },
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

  const formik = useFormik({
    initialValues: {
      project_id: "",
      sub_project_id: "",
      chart_id: "",
      member_name: "",
      dos: "",
      icd: "",
      dob: "",
      pages: "",
      no_of_dx_found_in_extractor: "",
      project_type: "",
      comments: "",
      action: "",
    },
    validationSchema: yup.object({
      project_id: yup.string().required("Project Name is required !"),
      sub_project_id: yup.string().required("Sub Project is required !"),
      project_type: yup.string().required("Project Type is required !"),
      chart_id: yup
        .string()
        .required("Chart ID is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !")
        .min(9, "Must be 9 numbers !"),
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
    }),
    validateOnChange: true,
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  const endpoint =
    chartStatus === "manually_audited"
      ? `coders/charts/${chartData?.id}`
      : "coders/charts";
  const mutation = useMutation({
    mutationFn: (values) => {
      // apiClient.post(`${endpoint}`, values, { componentName: "addcharts" }),
      const payload =
        chartStatus === "manually_audited"
          ? { ...values, audit_mode: "manual_audit" }
          : values;

      return apiClient.post(`${endpoint}`, payload, {
        componentName: "addcharts",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["getCharts"]);
      formik.resetForm();
      setChartStatus("");
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  useEffect(() => {
    const selectedValue = document.getElementsByClassName("comments_label")[0];
    if (formik.values.action === "Rejected" || formik.values.action === "SAR") {
      selectedValue.classList.add("required");
    } else {
      selectedValue.classList.remove("required");
    }
  }, [formik.values.action]);

  const SelectTypeOptionList = [
    { value: "HCC", label: "HCC" },
    { value: "No HCC", label: "No HCC" },
  ];
  const SelectStatusOptionList = [
    { value: "Code Completed", label: "Code Completed" },
    { value: "Rejected", label: "Rejected" },
    { value: "SAR", label: "SAR" },
  ];

  const staticDropdowns = [
    {
      name: "project_type",
      label: "Select Type",
      options: SelectTypeOptionList,
      isMulti: false,
      isMandatory: true,
    },
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

  const checkChartIdUnique = useDebouncedCallback(async (chartId) => {
    if (!chartId || chartId.length < 9) return;
    try {
      const response = await apiClient.post(`coders/validate/chart-id`, {
        chart_id: formik.values.chart_id,
        project_id: project_id.project_id,
      });
      const { data: chartData } = response.data;

      if (response.data.message == "Valid chart id") {
        setChartStatus("");
      } else {
        setChartStatus("manually_audited");
      }
      setChartData(chartData);
    } catch (err) {
      toast.error(err.response.data.message);
    }
  }, 500);

  const handleChartIdChange = (e) => {
    formik.handleChange(e);
    checkChartIdUnique(e.target.value);
  };
  useEffect(() => {
    if (!chartData || (Array.isArray(chartData) && chartData.length === 0)) {
      return;
    }

    if (chartData) {
      if (chartData?.dob) {
        const chartDataDob = format(parseISO(chartData?.dob), "MM/dd/yyyy");
        formik.setFieldValue("dob", chartDataDob);
      }
      setSelectedProjectId(chartData?.project_id);
      formik.setFieldValue("project_id", chartData?.project_id);
      formik.setFieldValue("sub_project_id", chartData?.sub_project_id);
      formik.setFieldValue("project_type", chartData?.project_type);
      formik.setFieldValue("member_name", chartData?.member_name);
      formik.setFieldValue("dos", chartData?.dos);
      formik.setFieldValue("icd", chartData?.icd);
      formik.setFieldValue("pages", chartData?.pages);
      formik.setFieldValue(
        "no_of_dx_found_in_extractor",
        chartData?.no_of_dx_found_in_extractor
      );
      formik.setFieldValue("action", chartData?.action);
      formik.setFieldValue("comments", chartData?.comments);
      formik.setErrors({});
      formik.setTouched({}, false);
    }
  }, [chartData]);
  return (
    <div className="card cus-card chart-form darkcard">
      <div className="card-body">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-start justify-content-end gy-2 px-2">
            {/* ChartID Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="ChartID" className="form-label required">
                Chart ID
              </label>
              <div className="d-flex">
                <input
                  type="text"
                  className={`form-control font-size13 custom-inputborder  ${
                    formik.touched.chart_id &&
                    formik.errors.chart_id &&
                    "is-invalid"
                  }`}
                  id="ChartID"
                  name="chart_id"
                  maxLength={9}
                  placeholder="Enter Valid Chart ID"
                  onChange={(e) => {
                    handleChartIdChange(e);
                    formik.setFieldTouched("chart_id", true, false);
                  }}
                  value={formik.values.chart_id}
                  onBlur={formik.handleBlur}
                />
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
            {/* Project Section*/}
            {dropdownFields.map(({ name, label, isMulti, isMandatory }) => {
              const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
                dropdowns[name];
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
                    classNamePrefix="custom-select"
                    className={`font-size13 ${
                      formik.touched[name] &&
                      formik.errors[name] &&
                      "is-invalid"
                    }`}
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
                    onMenuScrollToBottom={() => {
                      if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                      }
                    }}
                    onInputChange={handleInputChange}
                    onChange={(selectedOption) => {
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
            })}
            {/* Project Type Section */}
            {staticDropdowns.map(
              ({ name, label, options, isMulti, isMandatory }) => (
                <div className="col-lg-2 px-1" key={name}>
                  <label
                    id=""
                    htmlFor={name}
                    className={`form-label  ${isMandatory ? "required" : ""} `}
                  >
                    {label}
                  </label>

                  <Select
                    classNamePrefix="custom-select"
                    className={`font-size13 ${
                      formik.touched[name] &&
                      formik.errors[name] &&
                      "is-invalid"
                    } `}
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

            {/* DOB Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="DOB" className="form-label required">
                D.O.B (MM/DD/YYYY)
              </label>
              <DatePicker
                className={`form-control font-size13 darkcard ${
                  formik.touched.dob && formik.errors.dob ? "is-invalid" : ""
                }`}
                selected={
                  formik.values.dob
                    ? parse(formik.values.dob, "MM/dd/yyyy", new Date())
                    : null
                }
                onChange={(date) => {
                  const formattedDate = date ? format(date, "MM/dd/yyyy") : "";
                  formik.setFieldValue("dob", formattedDate);
                }}
                onBlur={() => formik.setFieldTouched("dob", true)}
                maxDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select date"
                showYearDropdown
                dropdownMode="select"
                isClearable
              />
              {formik.touched.dob && formik.errors.dob ? (
                <div className="invalid-feedback">{formik.errors.dob}</div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            {/* MemberName Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="MemberName" className="form-label required">
                Member Name
              </label>
              <input
                type="text"
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.member_name && formik.errors.member_name
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
              {formik.touched.member_name && formik.errors.member_name ? (
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
                  formik.touched.dos && formik.errors.dos && "is-invalid"
                }`}
                id="DOS"
                placeholder="Enter DOS"
                name="dos"
                maxLength={3}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("dos", true, false);
                }}
                value={formik.values.dos}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
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
                  formik.touched.icd && formik.errors.icd && "is-invalid"
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
                  const pastedValue = e.clipboardData.getData("text").trim();
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
                  formik.touched.pages && formik.errors.pages && "is-invalid"
                }`}
                id="pages"
                placeholder="Enter Pages"
                name="pages"
                maxLength={5}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("pages", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.pages}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
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
                  const pastedValue = e.clipboardData.getData("text").trim();
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
                  formik.touched.comments && formik.errors.comments
                    ? "is-invalid"
                    : ""
                }`}
                id="Comments"
                placeholder="Enter Comments"
                name="comments"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.comments}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
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
            <div className="col-lg-12 w-auto">
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <span>Loading...</span> : "Add Chart"}
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

export default AddChart;
