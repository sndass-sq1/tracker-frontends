import React, { useContext, useState } from "react";
import DropdownOptions from "../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import { useFormik } from "formik";
import * as yup from "yup";
import Select from "react-select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";
import { UserContext } from "../../UserContext/UserContext";

const AssignUser = ({ memberType, selectedTeamId, closeAllModals }) => {
  const queryClient = useQueryClient();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");

  const dropdownKey = `${memberType}_id`;
  const apiEndpoint = `teams/add-${memberType}/${selectedTeamId}`;
  const dropdownEndpoint = `${memberType}s/dropdown`;

  const dropdown = DropdownOptions(
    dropdownEndpoint,
    dropdownKey,
    optionSearchQuery
  );

  const handleInputChange = useDebouncedCallback((e) => {
    setOptionSearchQuery(e);
  }, 500);

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post(apiEndpoint, values, {
        componentName: `add${memberType}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["getTeams"]);
      formik.resetForm();
      closeAllModals();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  // Form validation
  const formik = useFormik({
    initialValues: {
      [dropdownKey]: [],
    },

    // initialValues: {
    //   [dropdownKey]: [],
    // },
    // validationSchema: yup.object({
    //   [dropdownKey]: yup
    //     .array()
    //     .min(
    //       1,
    //       `${memberType.charAt(0).toUpperCase() + memberType.slice(1)
    //       } is required`
    //     )
    //     .required(
    //       `${memberType.charAt(0).toUpperCase() + memberType.slice(1)
    //       } is required`
    //     ),
    // }),
    // onSubmit: async (values, { resetForm }) => {
    //   await mutation.mutateAsync(values);
    //   resetForm();
    //   setOptionSearchQuery("");
    // },

    validationSchema: yup.object({
      [dropdownKey]: yup
        .array()
        .of(
          yup.object({
            label: yup.string().required(),
            value: yup.string().required(),
          })
        )
        .min(
          1,
          `${memberType.charAt(0).toUpperCase() + memberType.slice(1)} is required`
        )
        .required(
          `${memberType.charAt(0).toUpperCase() + memberType.slice(1)} is required`
        ),
    }),

    onSubmit: async (values, { resetForm }) => {
      const payload = {
        [dropdownKey]: values[dropdownKey]?.map((opt) => opt.value),
      };

      await mutation.mutateAsync(payload);
      resetForm();
      setOptionSearchQuery("");
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="row align-items-end justify-content-start gy-2 px-2">
        <div className="col-lg px-1">
          <label htmlFor={dropdownKey} className="form-label required">
            {memberType.charAt(0).toUpperCase() + memberType.slice(1)}
          </label>
          <Select
            classNamePrefix={"custom-select"}
            className={`font-size13 ${formik.touched[dropdownKey] && formik.errors[dropdownKey] ? "is-invalid" : ""}`}
            isMulti
            isSearchable
            name={dropdownKey}
            options={dropdown?.data?.pages?.flatMap((page) => page.data) || []}
            value={formik.values[dropdownKey] || []}
            onMenuScrollToBottom={() => {
              if (dropdown.hasNextPage && !dropdown.isFetchingNextPage) {
                dropdown.fetchNextPage();
              }
            }}
            onInputChange={handleInputChange}
            onChange={(selectedOptions) => {
              formik.setFieldValue(dropdownKey, selectedOptions);
            }}
            onBlur={() => formik.setFieldTouched(dropdownKey, true)}
          />

          {formik.touched[dropdownKey] && formik.errors[dropdownKey] && (
            <div className="invalid-feedback">{formik.errors[dropdownKey]}</div>
          )}
        </div>

        <div className="w-100 d-flex justify-content-end ms-2 mt-3">
          <button
            type="submit"
            className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span>Loading...</span>
            ) : (
              `Add ${memberType.charAt(0).toUpperCase() + memberType.slice(1)}`
            )}
            <FaArrowRight className="ms-2" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default AssignUser;
