import { useContext, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import Select from "react-select";
import apiClient from "../../services/apiClient";
import * as yup from "yup";
import { FaArrowRight } from "react-icons/fa6";
import DropdownOptions from "../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import { useAuth } from "../../context/AuthContext";
import { UserContext } from "../../UserContext/UserContext";
const AddUser = () => {
  const queryClient = useQueryClient();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [searchQueries, setSearchQueries] = useState({
    // project_id: "",
    team_id: "",
    role_id: "",
    location_id: "",
  });
  const auth = useAuth();
  const dropdownEndpoints =
    auth.user.role === "lead"
      ? {
          login_email_id: "logins/available-logins",
          role_id: "roles/dropdown",
          location_id: "locations/dropdown",
        }
      : {
          // project_id: "projects/assigned",
          team_id: selectedProjectId
            ? `projects/teams/${selectedProjectId}`
            : null,
          role_id: "roles/dropdown",
          location_id: "locations/dropdown",
        };

  const dropdownFields =
    auth.user.role === "lead"
      ? [
          {
            name: "login_email_id",
            label: "Login",
            isMulti: false,
            isMandatory: false,
          },
          {
            name: "role_id",
            label: "Role",
            isMulti: false,
            isMandatory: true,
          },
          {
            name: "location_id",
            label: "Location",
            isMulti: false,
            isMandatory: true,
          },
        ]
      : [
          { name: "role_id", label: "Role", isMulti: false, isMandatory: true },
          {
            name: "location_id",
            label: "Location",
            isMulti: false,
            isMandatory: true,
          },
        ];
  const workModeOptions = [
    { label: "OnSite", value: "1" },
    { label: "Remote", value: "2" },
    { label: "Hybrid", value: "3" },
  ];
  const staticDropdowns = [
    {
      name: "work_mode_id",
      label: "Work Mode",
      options: workModeOptions,
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
  }, 500);

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(
        auth.user.role !== "lead" ? "users" : "teams/add/users",
        values,
        { componentName: "addUser" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(
        auth.user.role !== "lead" ? ["users"] : ["teams/add/users"]
      );
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
      name: "",
      email: "",
      employee_id: "",
      // project_id: "",
      team_id: "",
      role_id: "",
      location_id: "",
      work_mode_id: "",
    },
    validationSchema: yup.object({
      name: yup
        .string()
        .matches(/^[A-Za-z\s]+$/, "User Name must contain only letters")
        .min(3, "Too Short!")
        .max(30, "Must be 30 characters or less")
        .required("Name is required !"),
      email: yup
        .string()
        .required("Email is required !")
        .test(
          "no-spaces",
          "Spaces are not allowed in the email",
          (value) => !/\s/.test(value || "")
        )
        .email("Invalid email")
        .test(
          "is-pro1hs-email",
          "Only @pro1hs.com emails are allowed",
          (value) => value?.toLowerCase().endsWith("@pro1hs.com")
        ),

      employee_id: yup
        .string()
        .matches(/^[A-Za-z0-9]+$/, "Only letters and numbers are allowed")
        .max(20, "Must be 10 characters or less")
        .required("Employee id is required !"),
      role_id: yup.string().required("Role is required !"),
      location_id: yup.string().required("Location is required !"),
      work_mode_id: yup.string().required("Work mode is required !"),
    }),
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  return (
    <div className="card darkcard cus-card user-form">
      <div className="card-body">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-center justify-content-between gy-2 px-2">
            {/* Name Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="name" className="form-label required">
                Name
              </label>
              <input
                type="text"
                name="name"
                maxLength={30}
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.name && formik.errors.name && "is-invalid"
                }`}
                id="name"
                placeholder="Enter Name"
                // onChange={formik.handleChange}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("name", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
                  formik.setFieldValue("name", pastedValue);
                }}
              />
              {formik.touched.name && formik.errors.name ? (
                <div className="invalid-feedback ">{formik.errors.name}</div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
            {/* Email  Section*/}
            <div className="col-lg-2 px-1">
              <label htmlFor="email" className="form-label required">
                Email
              </label>
              <input
                type="email"
                name="email"
                maxLength={50}
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.email && formik.errors.email && "is-invalid"
                }`}
                id="email"
                placeholder="Enter Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
                  formik.setFieldValue("email", pastedValue);
                }}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="invalid-feedback ">{formik.errors.email}</div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>

            {/* Employee ID Section */}
            <div className="col-lg-2 px-1">
              <label htmlFor="employee_id" className="form-label required">
                Employee ID
              </label>
              <input
                type="text"
                name="employee_id"
                maxLength={20}
                className={`form-control font-size13 custom-inputborder  ${
                  formik.touched.employee_id &&
                  formik.errors.employee_id &&
                  "is-invalid"
                }`}
                id="employee_id"
                placeholder="Enter Employee ID"
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldTouched("employee_id", true, false);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.employee_id}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedValue = e.clipboardData.getData("text").trim();
                  formik.setFieldValue("employee_id", pastedValue);
                }}
              />
              {formik.touched.employee_id && formik.errors.employee_id ? (
                <div className="invalid-feedback ">
                  {formik.errors.employee_id}
                </div>
              ) : (
                <div className="invisible">
                  <span>invisible</span>
                </div>
              )}
            </div>
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
                    // // styles={customStyles(theme)}
                    classNamePrefix="custom-select"
                    className={`font-size13 ${
                      formik.touched[name] &&
                      formik.errors[name] &&
                      "is-invalid"
                    }`}
                    // classNamePrefix='select'
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
                    }}
                    onBlur={() => formik.setFieldTouched(name, true)}
                  />
                  {formik.touched[name] && formik.errors[name] ? (
                    <div className="invalid-feedback ">
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

            {staticDropdowns.map(
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
                    className={`font-size13 ${
                      formik.touched[name] &&
                      formik.errors[name] &&
                      "is-invalid"
                    }`}
                    // classNamePrefix="select cusdom-inputborder"
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
                    <div className="invalid-feedback ">
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

            <div className="col-lg-2  w-auto">
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <span>Loading...</span> : "Add User"}
                  <FaArrowRight className="ms-2" />
                </button>

                {/* <button type="reset" className="btn font-size13 py-2 px-4 d-flex align-items-center"
                  onClick={formik.resetForm}
                >
                  Clear
                </button> */}
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

export default AddUser;
