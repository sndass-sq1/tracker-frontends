import { useEffect, useState } from "react";
import { useFormik } from "formik";
import apiClient from "../../../services/apiClient";
import * as yup from "yup";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import DropdownOptions from "../../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";

const AddClientR = ({ project_id }) => {
  const queryClient = useQueryClient();
  const setSelectedProjectId = null;
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [searchQueries, setSearchQueries] = useState({
    project_id: "",
    sub_project_id: "",
  });
  const dropdownEndpoints = {
    project_id: "projects/dropdown/coder-project",
    sub_project_id: `sub-projects/dropdown/1`,
  };
  const subdropdownFields = [
    {
      name: "sub_project_id",
      label: "Sub-Project",
      isMulti: false,
      isMandatory: true,
    },
  ];
  const SelectTypeOptionList = [
    { value: "HCC", label: "HCC" },
    { value: "No HCC", label: "No HCC" },
  ];
  const SelectActionList = [
    { value: "Code Completed", label: "Code Completed" },
    { value: "Rejected", label: "Rejected" },
  ];
  const staticDropdowns = [
    {
      name: "project_type",
      label: "Select Type",
      options: SelectTypeOptionList,
      isMulti: false,
      isMandatory: true,
    },
    {
      name: "action",
      label: "Select Action",
      options: SelectActionList,
      isMulti: false,
      isMandatory: true,
    },
  ];

  const projectTypeDropdown = staticDropdowns?.find(
    (d) => d.name === "project_type"
  );
  const actionDropdown = staticDropdowns.find((d) => d.name === "action");

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
      project_id: 1,
      sub_project_id: "",
      project_type: "",
      chart_id: "",
      member_name: "",
      dob: "",
      icd: "",
      pages: "",
      comments: "",
      action: "",
    },
    validationSchema: yup.object({
      project_id: yup.string().required("Project Name is required !"),
      action: yup.string().required("Action is required !"),
      sub_project_id: yup.string().required("Sub Project is required !"),
      project_type: yup.string().required("Project Type is required !"),
      chart_id: yup
        .string()
        .required("Chase ID is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !")
        .min(8, "Must be 8 numbers !"),
      member_name: yup
        .string()
        .matches(/^[A-Za-z\s\-,_'’.]+$/, "Invalid member name")
        .min(3, "Too Short!")
        .max(30, "Must be 30 characters or less!")
        .required("Member Name is required!"),
      dob: yup.string().required("DOB is required !"),
      icd: yup
        .string()
        .required("Total ICD is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !"),
      pages: yup
        .string()
        .required("Total Pages is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !"),
      comments: yup.string().when("action", {
        is: (action) => action === "Rejected" || action === "SAR",
        then: (schema) => schema.required("Comments are required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post("coders/charts", values, { componentName: "addChartsR" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["chartsR"]);
      formik.resetForm();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const checkChartIdUnique = useDebouncedCallback(async (chartId) => {
    if (!chartId || chartId.length < 8) return;
    try {
      await apiClient.post(`coders/validate/chart-id`, {
        chart_id: formik.values.chart_id,
        project_id: project_id,
      });
    } catch (err) {
      toast.error(err.response.data.message);
    }
  }, 500);

  const handleChartIdChange = (e) => {
    formik.handleChange(e);
    checkChartIdUnique(e.target.value);
  };
  useEffect(() => {
    const selectedValue = document.getElementsByClassName("comments_label")[0];
    if (formik.values.action === "Rejected") {
      selectedValue.classList.add("required");
    } else {
      selectedValue.classList.remove("required");
    }
  }, [formik.values.action]);

  return (
    <div className="card cus-card darkcard">
      <div className="card-body ">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-end justify-content-start gy-2 px-2">
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
                  onChange={handleChartIdChange}
                  onBlur={formik.handleBlur}
                  value={"Client-R"}
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
            {/* Sub-Project Section */}
            {subdropdownFields.map(({ name, label, isMulti, isMandatory }) => {
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
                    // styles={customStyles(theme)}
                    classNamePrefix="custom-select"
                    className={`font-size13 ${
                      formik.touched[name] &&
                      formik.errors[name] &&
                      "is-invalid"
                    }`}
                    // classNamePrefix="select"                   ...baseStyles,
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
              );
            })}
            {/* Project Type Section */}
            {projectTypeDropdown && (
              <div className="col-lg-2 px-1" key={projectTypeDropdown.name}>
                <label
                  htmlFor={projectTypeDropdown.name}
                  className={`form-label ${
                    projectTypeDropdown.isMandatory ? "required" : ""
                  }`}
                >
                  {projectTypeDropdown.label}
                </label>
                <Select
                  // styles={customStyles(theme)}
                  classNamePrefix="custom-select"
                  className={`font-size13 ${
                    formik.touched[projectTypeDropdown.name] &&
                    formik.errors[projectTypeDropdown.name] &&
                    "is-invalid"
                  }`}
                  isMulti={projectTypeDropdown.isMulti}
                  isSearchable
                  name={projectTypeDropdown.name}
                  options={projectTypeDropdown.options}
                  value={
                    projectTypeDropdown.isMulti
                      ? projectTypeDropdown.options.filter((option) =>
                          formik.values[projectTypeDropdown.name]?.includes(
                            option.value
                          )
                        )
                      : projectTypeDropdown.options.find(
                          (option) =>
                            option.value ===
                            formik.values[projectTypeDropdown.name]
                        ) || null
                  }
                  onChange={(selectedOption) => {
                    formik.setFieldValue(
                      projectTypeDropdown.name,
                      projectTypeDropdown.isMulti
                        ? selectedOption.map((opt) => opt.value)
                        : selectedOption?.value || ""
                    );
                  }}
                  onBlur={() =>
                    formik.setFieldTouched(projectTypeDropdown.name, true)
                  }
                />
                {formik.touched[projectTypeDropdown.name] &&
                formik.errors[projectTypeDropdown.name] ? (
                  <div className="invalid-feedback">
                    {formik.errors[projectTypeDropdown.name]}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
            )}
            {/* Chase ID Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="ChartID" className="form-label required">
                Chase ID
              </label>
              <div className="d-flex">
                <input
                  type="text"
                  className={`form-control font-size13 darkcard-modal ${
                    formik.touched.chart_id &&
                    formik.errors.chart_id &&
                    "is-invalid"
                  }`}
                  id="ChartID"
                  name="chart_id"
                  maxLength={8}
                  placeholder="Enter Valid Chase ID"
                  onChange={(e) => {
                    handleChartIdChange(e);
                    formik.setFieldTouched("chart_id", true, false);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.chart_id}
                  // onPaste={(e) => {
                  //   e.preventDefault();
                  //   const pastedValue = e.clipboardData.getData("text").trim();
                  //   formik.setFieldValue("chart_id", pastedValue);
                  // }}
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
            {/* MemberName Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="MemberName" className="form-label required">
                Member Name
              </label>
              <input
                type="text"
                className={`form-control font-size13 darkcard ${
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
            {/* DOB Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="DOB" className="form-label required">
                DOB
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
                onBlur={formik.handleBlur}
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
            {/* Total HCC Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="TotalHcc" className="form-label required">
                Total HCC Category Reviewer
              </label>
              <input
                type="text"
                className={`form-control font-size13 darkcard ${
                  formik.touched.icd && formik.errors.icd && "is-invalid"
                }`}
                id="TotalHcc"
                placeholder="Enter Total HCC"
                name="icd"
                maxLength={4}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("icd", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.icd}
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
                className={`form-control font-size13 darkcard ${
                  formik.touched.pages && formik.errors.pages && "is-invalid"
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
            {/* Comments Section */}

            {actionDropdown && (
              <div className="col-lg-2 px-1" key={actionDropdown.name}>
                <label
                  htmlFor={actionDropdown.name}
                  className={`form-label ${
                    actionDropdown.isMandatory ? "required" : ""
                  }`}
                >
                  {actionDropdown.label}
                </label>
                <Select
                  // styles={customStyles(theme)}
                  classNamePrefix="custom-select"
                  className={`font-size13 ${
                    formik.touched[actionDropdown.name] &&
                    formik.errors[actionDropdown.name] &&
                    "is-invalid"
                  }`}
                  isMulti={actionDropdown.isMulti}
                  isSearchable
                  name={actionDropdown.name}
                  options={actionDropdown.options}
                  value={
                    actionDropdown.isMulti
                      ? actionDropdown.options.filter((option) =>
                          formik.values[actionDropdown.name]?.includes(
                            option.value
                          )
                        )
                      : actionDropdown.options.find(
                          (option) =>
                            option.value === formik.values[actionDropdown.name]
                        ) || null
                  }
                  onChange={(selectedOption) => {
                    formik.setFieldValue(
                      actionDropdown.name,
                      actionDropdown.isMulti
                        ? selectedOption.map((opt) => opt.value)
                        : selectedOption?.value || ""
                    );
                  }}
                  onBlur={() =>
                    formik.setFieldTouched(actionDropdown.name, true)
                  }
                />
                {formik.touched[actionDropdown.name] &&
                formik.errors[actionDropdown.name] ? (
                  <div className="invalid-feedback">
                    {formik.errors[actionDropdown.name]}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
            )}
            {/*comments */}
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
            <div className="col-lg-2  w-auto">
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

export default AddClientR;
