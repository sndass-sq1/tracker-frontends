import { useContext, useRef, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import DropdownOptions from "../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import { FaArrowRight } from "react-icons/fa6";
import { UserContext } from "../../UserContext/UserContext";

const AddGuideline = () => {
  const { theme } = useContext(UserContext);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const dropdownEndpoints = {
    project_id: "projects/dropdown",
  };
  const dropdownFields = [
    { name: "project_id", label: "Project", isMulti: false, isMandatory: true },
  ];

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(dropdownEndpoints[key], key, optionSearchQuery);
    return acc;
  }, {});
  const handleInputChange = useDebouncedCallback((e) => {
    setOptionSearchQuery(e);
  }, 500);

  const mutation = useMutation({
    mutationFn: (values) => {
      const formData = new FormData();
      formData.append("project_id", values.project_id?.value || null);
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("recitation_time", values.recitation_time);
      formData.append("pdf", values.pdf ? values.pdf : "");
      return apiClient.post("guidelines", formData, {
        componentName: "addGuideLine",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["guidelines"]);
      formik.resetForm();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      project_id: null,
      title: "",
      description: "",
      pdf: null,
      recitation_time: "",
    },
    validationSchema: yup.object({
      // project_id: yup.string().required("Project is required !"),
      project_id: yup
        .object({
          value: yup.string().required(),
          label: yup.string().required(),
        })
        .required("Project is required!"),
      title: yup
        .string()
        .matches(
          /^[A-Za-z0-9!@#$%^&*(),.?":{} |<>]+$/,
          "Only letters, numbers, and symbols are allowed"
        )
        .min(3, "Too Short !")
        .max(75, "Must be 30 characters or less !")
        .required("Title is required !"),
      description: yup
        .string()
        .min(3, "Too Short!")
        .required("Description is required !"),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  const handleFileChange = (event) => {
    formik.setFieldValue("pdf", event.currentTarget.files[0]);
  };

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
    <div className="card darkcard cus-card guide-form">
      <div className="card-body ">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-start justify-content-start gy-2 px-2">
            {/* Project Section */}
            {/* {dropdownFields.map(({ name, label, isMulti, isMandatory }) => {
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
                    Project
                  </label>
                  <Select
                    classNamePrefix="custom-select"
                    className={` font-size13 ${
                      formik.touched.project_id &&
                      formik.errors.project_id &&
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
                      formik.setFieldValue(
                        name,
                        isMulti
                          ? selectedOption.map((opt) => opt.value)
                          : selectedOption?.value || ""
                      );
                    }}
                    onBlur={() => formik.setFieldTouched(name, true)}
                  />
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
              );
            })} */}
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
                      // if (name === 'client_id' && !formik.values.client_id?.value) {
                      //   formik.setFieldError('client_id', 'Client is required!');
                      // }
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

            {/* title Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="title" className="form-label required">
                Title
              </label>
              <input
                type="text"
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.title && formik.errors.title && "is-invalid"
                }`}
                id="title"
                placeholder="Enter Title"
                name="title"
                maxLength={75}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("title", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.title}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
                  formik.setFieldValue("title", pastedValue);
                }}
              />
              {formik.touched.title && formik.errors.title ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.title}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            {/* description Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="Description" className="form-label  required">
                Description
              </label>
              <textarea
                className={`form-control font-size13 custom-inputborder ${
                  formik.touched.description &&
                  formik.errors.description &&
                  "is-invalid"
                }`}
                id="Description"
                placeholder="Enter Description"
                name="description"
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("description", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
                  formik.setFieldValue("description", pastedValue);
                }}
              />
              {formik.touched.description && formik.errors.description ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.description}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            {/* file Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="File" className="form-label">
                File
              </label>
              <input
                type="file"
                className={`form-control darkcard  font-size13 custom-inputborder ${
                  formik.touched.pdf && formik.errors.pdf ? " is-invalid" : ""
                }`}
                id="File"
                name="pdf"
                onChange={handleFileChange}
                onBlur={formik.handleBlur}
                accept=".pdf,.jpeg,.png,.xls,.xlsx,.csv,.gif"
                ref={fileInputRef}
              />
              <small className="text-muted  t-files">
                Accepted: jpeg, png, pdf, xls, xlsx, csv
              </small>
              {formik.touched.pdf && formik.errors.pdf ? (
                <div id="role" className="invalid-feedback">
                  {formik.errors.pdf}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            <div className="col-lg-2 w-auto">
              <div className="d-flex ">
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center guide-button"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <span>Loading...</span>
                  ) : (
                    "Add Guideline"
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
  );
};

export default AddGuideline;
