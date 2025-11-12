import { useState } from "react";
import DropdownOptions from "../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import { useFormik } from "formik";
import * as yup from "yup";
import Select from "react-select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";

const AddAuditor = ({ selectedTeamId }) => {
  const queryClient = useQueryClient();

  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const dropdownEndpoints = {
    auditor_id: "auditors/dropdown",
  };
  const dropdownFields = [
    { name: "auditor_id", label: "Auditor", isMulti: true, isMandatory: true },
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
      apiClient.post(`teams/add-auditor/${selectedTeamId}`, values, {
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
        <div className="row  align-items-end justify-content-start gy-2 px-2">
          {dropdownFields.map(({ name, isMulti, isMandatory }) => {
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
                <Select
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: "10px",
                      borderColor: "#8a8b8f33",

                      outline: "none",
                      boxShadow: state.isFocused ? "#33B1FF" : "none",
                      "&:hover": {
                        borderColor: state.isFocused ? "#33B1FF" : "#8a8b8f33",
                      },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#33B1FF"
                        : state.isFocused
                          ? "#E9F9F7"
                          : "white",
                      color: state.isSelected
                        ? "white"
                        : state.isFocused
                          ? "black"
                          : "black",
                      cursor: "pointer",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: "13px",
                      color: "#33363f9d",
                    }),
                  }}
                  className={` font-size13 ${
                    formik.touched.auditor_id &&
                    formik.errors.auditor_id &&
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
                        ? selectedOption.some((opt) => opt.value)
                        : selectedOption?.value || ""
                    );
                  }}
                  onBlur={() => formik.setFieldTouched(name, true)}
                />
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
          <div className="col-lg-3  w-auto">
            <div className="d-flex">
              <button
                type="submit"
                className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <span>Loading...</span> : "Add Auditor"}
                <FaArrowRight className="ms-2" />
              </button>
            </div>
            <div className="invisible">
              <span>invisible</span>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddAuditor;
