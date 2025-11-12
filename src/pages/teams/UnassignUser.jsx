import { useState } from "react";
import DropdownOptions from "../../components/DropdownOptions";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";

const UnassignUser = ({
  selectedTeamId,
  endpoint,
  label,
  addendpoint,
  fieldName,
  closeAllModals,
}) => {
  const queryClient = useQueryClient();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");

  const dropdownEndpoints = {
    [fieldName]: `teams/get-${addendpoint}/${selectedTeamId}`,
  };

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(dropdownEndpoints[key], key, optionSearchQuery);
    return acc;
  }, {});

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(`teams/remove-${endpoint}/${selectedTeamId}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
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
      [fieldName]: [],
    },
    validationSchema: yup.object({
      [fieldName]: yup
        .array()
        .min(1, `${label} is required !`)
        .required(`${label} is required !`),
    }),
    onSubmit: async (values, { resetForm }) => {
      await mutation.mutateAsync(values);
      resetForm();
      setOptionSearchQuery("");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="remove-audit align-items-end justify-content-start gy-2 px-lg-2">
        <div className="col-lg-12 px-2">
          <label htmlFor="user_id" className="form-label required">
            {label}
          </label>
          <div
            className="checkbox-container"
            style={{ maxHeight: "200px", overflowY: "auto" }}
            onScroll={(e) => {
              const { scrollTop, clientHeight, scrollHeight } = e.target;
              if (
                dropdowns[fieldName].hasNextPage &&
                !dropdowns[fieldName].isFetchingNextPage
              ) {
                if (scrollHeight - scrollTop <= clientHeight + 10) {
                  dropdowns[fieldName].fetchNextPage();
                }
              }
            }}
          >
            {/* {dropdowns[fieldName].data?.pages?.length > 0 && (
              <div className="form-check">
                <input
                  className="form-check-input custom-inputborder"
                  type="checkbox"
                  id={`select_all_${fieldName}`}
                  checked={
                    formik.values[fieldName].length > 0 &&
                    formik.values[fieldName].length ===
                      dropdowns[fieldName].data.pages.flatMap(
                        (page) => page.data
                      ).length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      formik.setFieldValue(
                        fieldName,
                        dropdowns[fieldName].data.pages
                          .flatMap((page) => page.data)
                          .map((option) => option.value)
                      );
                    } else {
                      formik.setFieldValue(fieldName, []);
                    }
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor={`select_all_${fieldName}`}
                >
                  Select All
                </label>
              </div>
            )} */}
            {dropdowns[fieldName].data?.pages?.length > 0 ? (
              dropdowns[fieldName].data.pages
                .flatMap((page) => page.data)
                .map((option) => (
                  <div key={option.value} className="form-check">
                    <input
                      className="form-check-input custom-inputborder "
                      type="checkbox"
                      id={`user_${option.value}`}
                      value={option.value}
                      checked={formik.values[fieldName].includes(option.value)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        formik.setFieldValue(
                          fieldName,
                          isChecked
                            ? [...formik.values[fieldName], option.value]
                            : formik.values[fieldName].filter(
                                (id) => id !== option.value
                              )
                        );
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`user_${option.value}`}
                    >
                      {option.label}
                    </label>
                  </div>
                ))
            ) : (
              <p>No {label.toLowerCase()}s found</p>
            )}
          </div>
          {formik.touched[fieldName] && formik.errors[fieldName] && (
            <div className="invalid-feedback">{formik.errors[fieldName]}</div>
          )}
        </div>
        <div className="col-lg-1 w-auto d-flex justify-content-end mt-3">
          {mutation.isPending ? (
            <button
              className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center justify-content-end"
              type="button"
              disabled
            >
              <span
                className="spinner-grow spinner-grow-sm"
                aria-hidden="true"
              ></span>
              <span role="status">Loading...</span>
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center justify-content-end"
            >
              Remove {label}
              <FaArrowRight className="ms-2" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default UnassignUser;
