import { useState } from "react";
import DropdownOptions from "../../components/DropdownOptions";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";

const RemoveAuditor = ({ selectedTeamId }) => {
  const queryClient = useQueryClient();

  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const dropdownEndpoints = {
    auditor_id: `teams/get-auditors/${selectedTeamId}`,
  };
  const dropdownFields = [
    { name: "auditor_id", label: "Auditor", isMulti: true, isMandatory: true },
  ];

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(dropdownEndpoints[key], key, optionSearchQuery);
    return acc;
  }, {});

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(`teams/remove-auditor/${selectedTeamId}`, values, {
        componentName: "addTeam",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      formik.resetForm();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  // Form validation with Yup
  const formik = useFormik({
    initialValues: {
      auditor_id: [],
    },
    validationSchema: yup.object({
      auditor_id: yup.array().required("Auditor is required !"),
    }),
    onSubmit: async (values, { resetForm }) => {
      await mutation.mutateAsync(values);
      resetForm();
      setOptionSearchQuery("");
    },
  });
  return (
    <>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <div className=" align-items-end justify-content-start gy-2 px-lg-2">
          {dropdownFields.map(({ name, label, isMandatory }) => {
            const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
              dropdowns[name];
            const options =
              data?.pages?.reduce((acc, page) => [...acc, ...page.data], []) ||
              [];
            return (
              <div className="col-lg-3 px-1" key={name}>
                <label
                  htmlFor={name}
                  className={`form-label ${
                    isMandatory == true ? "required" : ""
                  }`}
                >
                  Auditor
                </label>
                <div
                  className="checkbox-container"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                  onScroll={(e) => {
                    if (hasNextPage && !isFetchingNextPage) {
                      const { scrollTop, clientHeight, scrollHeight } =
                        e.target;
                      if (scrollHeight - scrollTop <= clientHeight + 10) {
                        fetchNextPage();
                      }
                    }
                  }}
                >
                  {options.length > 0 ? (
                    options.map((option) => (
                      <div key={option.value} className="form-check">
                        <input
                          className="form-check-input custom-inputborder "
                          type="checkbox"
                          id={`auditor_${option.value}`}
                          value={option.value}
                          checked={formik.values.auditor_id.includes(
                            option.value
                          )}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            formik.setFieldValue(
                              name,
                              isChecked
                                ? [...formik.values[name], option.value]
                                : formik.values[name].filter(
                                    (id) => id !== option.value
                                  )
                            );
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`auditor_${option.value}`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p>No auditors found</p>
                  )}
                </div>
                {formik.touched.auditor_id && formik.errors.auditor_id ? (
                  <div id="role" className="invalid-feedback">
                    {formik.errors.auditor_id}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
            );
          })}
          <div className="col-lg-1 w-auto">
            {mutation.isPending ? (
              <button
                className="btn btn-primary font-size13 py-1 px-4"
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
                className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
              >
                Remove Auditor
                <FaArrowRight className="ms-2" />
              </button>
            )}
            {/* <button type="reset" className="btn font-size13 py-2 px-4 d-flex align-items-center"
                            onClick={formik.resetForm}
                        >
                            Clear
                        </button> */}
            <div className="invisible">
              <span>invisible</span>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
export default RemoveAuditor;
