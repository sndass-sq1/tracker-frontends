import { useState, useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Select from "react-select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";
import { useDebouncedCallback } from "use-debounce";
import DropdownOptions from "../../components/DropdownOptions";
import { UserContext } from "../../UserContext/UserContext";

const AddProject = () => {
  const queryClient = useQueryClient();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const { theme } = useContext(UserContext);

  const dropdownEndpoints = {
    client_id: "clients/dropdown",
  };
  const dropdownFields = [
    { name: "client_id", label: "Client", isMulti: false, isMandatory: true },
  ];

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(dropdownEndpoints[key], key, optionSearchQuery);
    return acc;
  }, {});
  const handleInputChange = useDebouncedCallback((e) => {
    setOptionSearchQuery(e);
  }, 500);

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post("projects", values, { componentName: "addProject" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      formik.resetForm();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      client_id: null,
      project_name: "",
      project_code: "",
    },
    validationSchema: yup.object({
      client_id: yup
        .object()
        .shape({
          value: yup.string().required("Client is required!"),
          label: yup.string(),
        })
        .required("Client is required!"),
      project_name: yup
        .string()
        .matches(
          /^[A-Za-z0-9-_ ]+$/,
          "Only string, number,underscore and hypen are allowed !"
        )
        .min(3, "Too Short!")
        .max(30, "Must be 30 characters or less !")
        .required("Project name is required !"),
      project_code: yup
        .string()
        .matches(
          /^[A-Za-z0-9!@#$%^&*(),-_.?":{}|<> ]+$/,
          "Only letters, numbers, and symbols are allowed !"
        )
        .min(3, "Too Short !")
        .max(30, "Must be 30 characters or less !")
        .required("Project code is required !"),
    }),
    onSubmit: async (values) => {
      const submissionValues = {
        ...values,
        client_id: values.client_id?.value,
      };
      await mutation.mutateAsync(submissionValues);
    },
  });
  const customStyles = (theme) => ({
    control: (base) => ({
      ...base,
      width: "100%",
      minWidth: "200px",
      overflow: "hidden",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 99999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 99999,
    }),
    valueContainer: (base) => ({
      ...base,
      overflowX: "auto",
      flexWrap: "nowrap",
      paddingRight: "8px",
    }),
    multiValue: (base) => ({
      ...base,
      maxWidth: "150px",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
    }),
    option: (base) => ({
      ...base,
      backgroundColor: "transparent",
      color: base.color,
      cursor: "pointer",
      padding: "8px 12px",
      fontSize: "14px",
      zIndex: 9999,
    }),
    noOptionsMessage: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#222" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      fontSize: "14px",
      padding: 10,
      textAlign: "center",
    }),
  });

  return (
    <>
      <div className="card darkcard cus-card project-form">
        <div className="card-body">
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <div className="row gy-2 px-2">
              {dropdownFields.map(({ name, label, isMulti, isMandatory }) => {
                const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
                  dropdowns[name];
                const options = data?.pages?.flatMap((page) => page.data) || [];
                const selected = formik.values[name];
                const selectedOptions = isMulti
                  ? selected || []
                  : selected
                    ? [selected]
                    : [];
                const mergedOptions = [
                  ...selectedOptions.filter(
                    (sel) => !options.some((opt) => opt.value === sel?.value)
                  ),
                  ...options,
                ];

                return (
                  <div className="col-lg-3 px-1" key={name}>
                    <label
                      htmlFor={name}
                      className={`form-label ${isMandatory ? "required" : ""}`}
                    >
                      {label}
                    </label>
                    <Select
                      styles={customStyles(theme)}
                      menuPortalTarget={document.body}
                      classNamePrefix="custom-select"
                      className={`font-size13 ${formik.touched[name] && formik.errors[name] ? "is-invalid" : ""}`}
                      isMulti={isMulti}
                      isSearchable
                      closeMenuOnSelect={!isMulti}
                      hideSelectedOptions={false}
                      name={name}
                      options={mergedOptions}
                      value={formik.values[name] || []}
                      onMenuScrollToBottom={() => {
                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                      }}
                      onInputChange={(val) => handleInputChange(val, name)}
                      onChange={(selectedOption) =>
                        formik.setFieldValue(name, selectedOption)
                      }
                      onBlur={() => {
                        formik.setFieldTouched(name, true);
                        // Additional validation for client_id object
                        if (
                          name === "client_id" &&
                          !formik.values.client_id?.value
                        ) {
                          formik.setFieldError(
                            "client_id",
                            "Client is required!"
                          );
                        }
                      }}
                      components={
                        isMulti ? { Option: CheckboxOption } : undefined
                      }
                    />
                    {formik.touched[name] && formik.errors[name] && (
                      <div className="invalid-feedback">
                        {typeof formik.errors[name] === "object"
                          ? formik.errors[name]?.value || "Invalid selection"
                          : formik.errors[name]}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="col-lg-3 px-1 ">
                <label htmlFor="projectName" className="form-label required">
                  Project Name
                </label>
                <input
                  type="text"
                  className={`form-control font-size13 custom-inputborder  ${
                    formik.touched.project_name &&
                    formik.errors.project_name &&
                    "is-invalid"
                  }`}
                  id="projectName"
                  placeholder="Enter project Name"
                  name="project_name"
                  maxLength={30}
                  // onChange={formik.handleChange}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldTouched("project_name", true, false);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.project_name}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedValue = e.clipboardData.getData("text").trim();
                    formik.setFieldValue("project_name", pastedValue);
                  }}
                />
                {formik.touched.project_name && formik.errors.project_name ? (
                  <div id="role" className="invalid-feedback ">
                    {formik.errors.project_name}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>

              <div className="col-lg-3 px-1 ">
                <label htmlFor="projectCode" className="form-label required">
                  Project Code
                </label>
                <input
                  type="text"
                  className={`form-control font-size13 custom-inputborder  ${
                    formik.touched.project_code &&
                    formik.errors.project_code &&
                    "is-invalid"
                  }`}
                  id="projectCode"
                  placeholder="Enter project Code"
                  name="project_code"
                  maxLength={30}
                  //onChange={formik.handleChange}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldTouched("project_code", true, false);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.project_code}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedValue = e.clipboardData.getData("text").trim();
                    formik.setFieldValue("project_code", pastedValue);
                  }}
                />
                {formik.touched.project_code && formik.errors.project_code ? (
                  <div id="role" className="invalid-feedback ">
                    {formik.errors.project_code}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>

              <div className="col-lg-3 w-auto d-flex  d-flex justify-content-center align-items-center">
                <div className="d-flex">
                  <button
                    type="submit"
                    className="btn btn-primary  custom-primary-btn font-size13 py-2 px-4 "
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <span>Loading...</span>
                    ) : (
                      "Add Project"
                    )}
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
    </>
  );
};

export default AddProject;
