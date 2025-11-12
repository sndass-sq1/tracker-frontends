import { useState, useEffect } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import Select from "react-select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { format, parse, parseISO } from "date-fns";
import { FaArrowRight } from "react-icons/fa6";
import { useDebouncedCallback } from "use-debounce";
import DatePicker from "react-datepicker";
import DropdownOptions from "../../../components/DropdownOptions";
import apiClient from "../../../services/apiClient";
import { FaSearch } from "react-icons/fa";

const AddHumana = ({ projectID }) => {
  const queryClient = useQueryClient();
  const humanaProjectID = Number(import.meta.env.VITE_APP_HUMANA);
  const libertyProjectID = Number(import.meta.env.VITE_APP_LIBERTY);
  const prominenceProjectID = Number(import.meta.env.VITE_APP_PROMINENCE);
  const humanaWave2ProjectID = Number(import.meta.env.VITE_APP_HUMANA_WAVE_2);
  const [chartStatus, setChartStatus] = useState("");
  const [chartData, setChartData] = useState("");
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [showFields, setShowFields] = useState(false);
  const [searchQueries, setSearchQueries] = useState({
    project_id: "",
    sub_project_id: "",
  });
  const project_name = projectID?.this_project;
  const initialProjectId = (() => {
    if (project_name === humanaProjectID) return humanaProjectID;
    if (project_name === libertyProjectID) return libertyProjectID;
    if (project_name === prominenceProjectID) return prominenceProjectID;
    if (project_name === humanaWave2ProjectID) return humanaWave2ProjectID;
    return "";
  })();
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [currentChartId, setCurrentChartId] = useState("");
  const [showsearch, setShowSearch] = useState(false);
  useEffect(() => {
    const id = currentChartId || "";
    if (id?.length > 0) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  }, [currentChartId]);
  const projectDropdown = DropdownOptions(
    "projects/dropdown/coder-humana-project",
    "project_id",
    optionSearchQuery
  );

  const subProjectDropdown = selectedProjectId
    ? DropdownOptions(
        `sub-projects/dropdown/${selectedProjectId}`,
        "sub_project_id",
        optionSearchQuery
      )
    : {
        data: { pages: [{ data: [] }] },
        fetchNextPage: () => {},
        hasNextPage: false,
        isFetchingNextPage: false,
      };

  // Define dropdowns object
  const dropdowns = {
    project_id: projectDropdown,
    sub_project_id: subProjectDropdown,
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

  const handleInputChange = useDebouncedCallback((inputValue, dropdownName) => {
    setOptionSearchQuery(inputValue);
    setSearchQueries((prev) => ({
      ...prev,
      [dropdownName]: inputValue,
    }));
  }, 500);

  const formik = useFormik({
    initialValues: {
      project_id: initialProjectId,
      sub_project_id: "",
      file_name: "",
      member_id: "",
      member_name: "",
      dos: "",
      icd: "",
      dob: "",
      pages: "",
      project_type: "",
      comments: "",
      action: "",
    },
    validationSchema: yup.object({
      project_id: yup.string().required("Project Name is required !"),
      sub_project_id: yup.string().required("Sub Project is required !"),
      project_type: yup.string().required("Project Type is required !"),
      file_name: yup.string().required("File Name is required !"),
      member_id: yup.string().required("Member ID is required!"),
      member_name: yup
        .string()
        .matches(/^[A-Za-z\s\-,_'’.]+$/, "Invalid PT name")
        .min(3, "Too Short!")
        .max(30, "Must be 30 characters or less!")
        .required("PT Name is required !"),
      dos: yup
        .string()
        .required("Total DOS is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !"),
      dob: yup.string().required("PT DOB is required !"),
      icd: yup
        .string()
        .required("Total ICD is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !"),
      pages: yup
        .string()
        .required("Total Pages is required !")
        .matches(/^[0-9]+$/, "Must contain only numbers !"),
      action: yup.string().required("Action is required !"),
      comments: yup.string().when("action", {
        is: (action) => action === "Rejected" || action === "SAR",
        then: (schema) => schema.required("Comments are required !"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    validateOnChange: true,
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
      setCurrentChartId("");
      setShowFields(false);
      resetForm();
    },
  });

  const endpoint =
    chartStatus === "manually_audited"
      ? `coders/charts/${chartData?.id}`
      : "coders/charts";

  const mutation = useMutation({
    mutationFn: (values) => {
      const payload =
        chartStatus === "manually_audited"
          ? {
              ...values,
              audit_mode: "manual_audit",
              file_name: chartData?.chart_uid,
            }
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

  const checkChartIdUnique = async (filename) => {
    if (!filename || filename?.length < 0) return;
    try {
      const response = await apiClient.post(`coders/validate/chart-id`, {
        project_id: formik.values.project_id,
        file_name: formik.values.file_name,
      });

      const { data: chartData } = response.data;
      if (response.data.message == "Manually Audited!") {
        setChartStatus("manually_audited");
      } else {
        setChartStatus("");
        // setChartStatus("");
      }
      setChartData(chartData);
      setShowFields(true);
    } catch (err) {
      // setChartStatus("manually_audited");
      toast.error(err.response?.data.message);
    }
  };

  useEffect(() => {
    const selectedValue = document.getElementsByClassName("comments_label")[0];
    if (!selectedValue) return;

    if (formik.values.action === "Rejected" || formik.values.action === "SAR") {
      selectedValue.classList.add("required");
    } else {
      selectedValue.classList.remove("required");
    }
  }, [formik.values.action, showFields]);

  useEffect(() => {
    if (!chartData || (Array.isArray(chartData) && chartData?.length === 0)) {
      return;
    }

    if (chartData) {
      setShowFields(true);
      if (chartData?.dob) {
        const chartDataDob = format(parseISO(chartData?.dob), "MM/dd/yyyy");
        formik.setFieldValue("dob", chartDataDob);
      }
      setSelectedProjectId(chartData?.project_id);
      formik.setFieldValue("project_id", chartData?.project_id);
      formik.setFieldValue("sub_project_id", chartData?.sub_project_id);
      formik.setFieldValue("project_type", chartData?.project_type);
      formik.setFieldValue("member_id", chartData?.member_id);
      formik.setFieldValue("member_name", chartData?.member_name);
      formik.setFieldValue("file_name", chartData?.chart_uid);
      formik.setFieldValue("dos", chartData?.dos);
      formik.setFieldValue("icd", chartData?.icd);
      formik.setFieldValue("pages", chartData?.pages);
      formik.setFieldValue("action", chartData?.action);
      formik.setFieldValue("comments", chartData?.comments);
      formik.setErrors({});
      formik.setTouched({}, false);
    }
  }, [chartData]);

  return (
    <div className="card cus-card chart-form darkcard">
      <div className="card-body ">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-end justify-content-start gy-2 px-2">
            {/* file_name Section */}
            <div className="col-lg-4 px-1">
              <label htmlFor="FileName" className="form-label required">
                File Name
              </label>
              <div className="d-flex">
                <input
                  type="text"
                  className={`form-control font-size13 custom-inputborder  ${
                    formik.touched.file_name &&
                    formik.errors.file_name &&
                    "is-invalid"
                  }`}
                  id="FileName"
                  name="file_name"
                  placeholder="Enter File Name"
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldTouched("file_name", true, false);
                    setCurrentChartId(e.target.value);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.file_name}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      checkChartIdUnique(formik.values.file_name.trim());
                      setCurrentChartId(formik.values.file_name.trim());
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    let pastedValue = e.clipboardData.getData("text").trim();
                    formik.setFieldValue("file_name", pastedValue);
                    setCurrentChartId(pastedValue);
                    formik.setFieldTouched("file_name", true);
                    formik.validateField("file_name");
                  }}
                />
                <button
                  className="btn btn-primary custom-primary-btn outline-none border-0 ms-2"
                  type="button"
                  id="button-addon2"
                  disabled={!showsearch}
                  onClick={() =>
                    checkChartIdUnique(formik.values.file_name.trim())
                  }
                >
                  <FaSearch className="" />
                </button>
              </div>

              {formik.touched.file_name && formik.errors.file_name ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.file_name}
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
                {/* project & Sub-Project Section */}
                {dropdownFields.map(({ name, label, isMulti, isMandatory }) => {
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
                        className={`form-label ${isMandatory === true ? "required" : ""}`}
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
                        onInputChange={(inputValue) =>
                          handleInputChange(inputValue, name)
                        }
                        onChange={(selectedOption) => {
                          const value = isMulti
                            ? selectedOption.map((opt) => opt.value)
                            : selectedOption?.value || "";

                          formik.setFieldValue(name, value);

                          if (name === "project_id") {
                            setSelectedProjectId(value);
                            formik.setFieldValue("sub_project_id", "");
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
                {/*  Member ID Section */}
                <div className="col-lg-2 px-1">
                  <label htmlFor="MemberID" className="form-label required">
                    Member ID
                  </label>
                  <div className="d-flex">
                    <input
                      type="text"
                      className={`form-control font-size13  ${
                        formik.touched.member_id &&
                        formik.errors.member_id &&
                        "is-invalid"
                      }`}
                      id="MemberID"
                      name="member_id"
                      maxLength={20}
                      placeholder="Enter Valid Member ID"
                      onChange={(e) => {
                        // handleChartIdChange(e);
                        formik.handleChange(e);
                        formik.setFieldTouched("member_id", true, false);
                      }}
                      value={formik.values.member_id}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  {formik.touched.member_id && formik.errors.member_id ? (
                    <div id="role" className="invalid-feedback">
                      {formik.errors.member_id}
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
                    PT Name
                  </label>
                  <input
                    type="text"
                    className={`form-control font-size13 custom-inputborder  ${
                      formik.touched.member_name && formik.errors.member_name
                        ? "is-invalid"
                        : ""
                    }`}
                    id="MemberName"
                    placeholder="Enter  PT Name"
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
                    PT D.O.B
                  </label>
                  <DatePicker
                    className={`form-control font-size13 darkcard ${
                      formik.touched.dob && formik.errors.dob
                        ? "is-invalid"
                        : ""
                    }`}
                    selected={
                      formik.values.dob
                        ? parse(formik.values.dob, "MM/dd/yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      const formattedDate = date
                        ? format(date, "MM/dd/yyyy")
                        : "";
                      formik.setFieldValue("dob", formattedDate);
                    }}
                    onBlur={() => formik.setFieldTouched("dob", true)}
                    maxDate={
                      new Date(new Date().setDate(new Date().getDate() - 1))
                    }
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select  PT D.O.B"
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
                    maxLength={5}
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
                        classNamePrefix="custom-select"
                        className={`font-size13 required ${
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
                <div className="col-lg-12 w-auto">
                  <div className="d-flex">
                    <button
                      type="submit"
                      className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                      disabled={mutation.isPending || !chartData}
                    >
                      {mutation.isPending ? (
                        <span>Loading...</span>
                      ) : (
                        "Add Chart"
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
    </div>
  );
};

export default AddHumana;
