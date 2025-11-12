import { useState } from "react";
import DropdownOptions from "../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import { useFormik } from "formik";
import * as yup from "yup";
import Select from "react-select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa6";

const AddCoder = ({ selectedTeamId }) => {
  const queryClient = useQueryClient();

  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const dropdownEndpoints = {
    coder_id: "coders/dropdown",
  };
  const dropdownFields = [
    { name: "coder_id", label: "Coder", isMulti: true, isMandatory: true },
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
      apiClient.post(`teams/add-coder/${selectedTeamId}`, values, {
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
      coder_id: [],
    },
    validationSchema: yup.object({
      coder_id: yup.array().required("Coder is required !"),
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
        <div className="row align-items-end justify-content-start gy-2 px-2 d-flex flex-column">
          {dropdownFields.map(({ name, isMulti, isMandatory }) => {
            const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
              dropdowns[name];
            const options =
              data?.pages?.reduce((acc, page) => [...acc, ...page.data], []) ||
              [];
            return (
              <div className="col-lg px-1" key={name}>
                <label
                  htmlFor={name}
                  className={`form-label ${
                    isMandatory == true ? "required" : ""
                  }`}
                >
                  Coder
                </label>
                <Select
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: "10px",
                      borderColor: "#8a8b8f33",

                      outline: "none",
                      boxShadow: state.isFocused ? "#24c8b5" : "none",
                      borderColor: state.isFocused ? "#24c8b5" : "#8a8b8f33",
                      "&:hover": {
                        borderColor: state.isFocused ? "#24c8b5" : "#8a8b8f33",
                      },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#24c8b5"
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
                  className={`w-100 font-size13 ${
                    formik.touched.coder_id &&
                    formik.errors.coder_id &&
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
                {formik.touched.coder_id && formik.errors.coder_id ? (
                  <div id="role" className="invalid-feedback">
                    {formik.errors.coder_id}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
            );
          })}
          <div className=" w-100 ">
            <div className="w-100 d-flex justify-content-end ms-2">
              <button
                type="submit"
                className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <span>Loading...</span> : "Add Coder"}
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

export default AddCoder;
