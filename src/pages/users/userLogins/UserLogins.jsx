import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as yup from "yup";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";
import DropdownOptions from "../../../components/DropdownOptions";
import { FaArrowRight } from "react-icons/fa6";
import apiClient from "../../../services/apiClient";

const UserLogins = ({ selectedUserId, closeAllModals }) => {
  const queryClient = useQueryClient();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [searchQueries, setSearchQueries] = useState({
    login_email_id: "",
  });

  const dropdownEndpoints = {
    login_email_id: "logins/available-logins",
  };

  const dropdownFields = [
    {
      name: "login_email_id",
      label: "Logins",
      isMulti: false,
      isMandatory: true,
    },
  ];

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(dropdownEndpoints[key], key, optionSearchQuery);
    return acc;
  }, {});

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(`logins/user-email-mapping/${selectedUserId}`, values, {
        componentName: "addUser",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      formik.resetForm();
      closeAllModals();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      login_email_id: null,
    },
    validationSchema: yup.object({
      login_email_id: yup
        .object({
          label: yup.string().required(),
          value: yup.string().required(),
        })
        .required("Login name is required!"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        login_email_id: values.login_email_id.value,
      };
      await mutation.mutateAsync(payload);
      resetForm();
      setOptionSearchQuery("");
    },
  });

  const handleInputChange = useDebouncedCallback((e, dropdownName) => {
    setOptionSearchQuery(e);
    setSearchQueries((prev) => ({
      ...prev,
      [dropdownName]: e,
    }));
  }, 500);

  return (
    <div className="card cus-card">
      <div className="card-body font-size13 darkcard border-0 shadow-none">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row align-items-center justify-content-start px-lg-2">
            {dropdownFields.map(({ name, label, isMulti, isMandatory }) => {
              const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
                dropdowns[name];

              const options = data?.pages?.flatMap((page) => page.data) || [];
              const selectedValue = formik.values[name];

              const selectedOptions = isMulti
                ? selectedValue || []
                : selectedValue
                  ? [selectedValue]
                  : [];

              const mergedOptions = [
                ...selectedOptions.filter(
                  (selOpt) =>
                    !options.some((opt) => opt.value === selOpt?.value)
                ),
                ...options,
              ];

              return (
                <div className="col-lg-8 px-1" key={name}>
                  <label
                    htmlFor={name}
                    className={`form-label ${isMandatory ? "required" : ""}`}
                  >
                    {label}
                  </label>
                  <Select
                    classNamePrefix="custom-select"
                    className={`font-size13 ${formik.touched[name] && formik.errors[name]
                      ? "is-invalid"
                      : ""
                      }`}
                    isMulti={isMulti}
                    isSearchable
                    name={name}
                    options={mergedOptions}
                    value={
                      isMulti
                        ? mergedOptions.filter((opt) =>
                          selectedValue?.some(
                            (v) => v?.value === opt.value
                          )
                        )
                        : mergedOptions.find(
                          (opt) => opt.value === selectedValue?.value
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
                      formik.setFieldValue(name, selectedOption);
                    }}
                    onBlur={() => formik.setFieldTouched(name, true)}
                  />
                  {formik.touched[name] && formik.errors[name] ? (
                    <div className="invalid-feedback">
                      {formik.errors[name]?.value ||
                        formik.errors[name]?.label ||
                        formik.errors[name]}
                    </div>
                  ) : (
                    <div className="invisible">
                      <span>invisible</span>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="col-lg-4 w-auto">
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-cenetr mt-4"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <span>Loading...</span>
                  ) : (
                    "Assign Login"
                  )}
                  <FaArrowRight className="ms-2 mt-1" />
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

export default UserLogins;
