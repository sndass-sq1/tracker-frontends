import { useContext, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Select, { components } from "react-select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import DropdownOptions from "../../components/DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import { FaArrowRight } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { Collapse } from "react-bootstrap";
import { UserContext } from "../../UserContext/UserContext";

const AddTeam = () => {
  const queryClient = useQueryClient();
  const [searchQueries, setSearchQueries] = useState({});
  const auth = useAuth();
  const { theme, openTeamAccordion, setOpenTeamAccordion } =
    useContext(UserContext);

  const dropdownEndpoints = {
    project_id: "projects/dropdown",
    lead_id: "leads/dropdown",
    manager_id: "managers/dropdown",
    project_head_id: "project-heads/dropdown",
    sme_id: "sme/dropdown",
    coder_id: "coders/dropdown",
    auditor_id: "auditors/dropdown",
  };

  const dropdownFields = [
    { name: "project_id", label: "Project", isMulti: false, isMandatory: true },
    { name: "lead_id", label: "Lead", isMulti: false, isMandatory: true },
    {
      name: "manager_id",
      label: "Manager",
      isMulti: false,
      isMandatory: true,
    },
    {
      name: "project_head_id",
      label: "Project Head",
      isMulti: false,
      isMandatory: false,
    },
    {
      name: "sme_id",
      label: "SME",
      isMulti: false,
      isMandatory: auth.user.role === "project_head" ? true : false,
    },
    { name: "coder_id", label: "Coder", isMulti: true, isMandatory: false },
    { name: "auditor_id", label: "Auditor", isMulti: true, isMandatory: false },
  ];

  if (auth.user.role === "manager") {
    dropdownFields.splice(
      dropdownFields.findIndex((f) => f.name === "manager_id"),
      1
    );
  }
  if (auth.user.role === "project_head") {
    dropdownFields.splice(
      dropdownFields.findIndex((f) => f.name === "project_head_id"),
      1
    );
  }
  // if (auth.user.role === "project_head") {
  //   dropdownFields.splice(
  //     dropdownFields.findIndex((f) => f.name === "sme_id"),
  //     1
  //   );
  // }
  // if (!["super_admin", "manager"].includes(auth.user.role)) {
  //   dropdownFields.splice(
  //     dropdownFields.findIndex((f) => f.name === "manager_id"),
  //     1
  //   );
  //   dropdownFields.splice(
  //     dropdownFields.findIndex((f) => f.name === "project_head_id"),
  //     1
  //   );
  // }

  const dropdowns = Object.keys(dropdownEndpoints).reduce((acc, key) => {
    acc[key] = DropdownOptions(
      dropdownEndpoints[key],
      key,
      searchQueries[key] || ""
    );
    return acc;
  }, {});

  const formik = useFormik({
    initialValues: {
      project_id: null,
      lead_id: null,
      manager_id: null,
      project_head_id: "",
      sme_id: null,
      auditor_id: [],
      coder_id: [],
    },
    validationSchema: yup.object({
      project_id: yup
        .object({
          value: yup.string().required(),
          label: yup.string().required(),
        })
        .required("Project is required!"),
      manager_id: yup
        .object({
          value: yup.string().required(),
          label: yup.string().required(),
        })
        .when([], {
          is: () =>
            auth.user.role === "project_head" ||
            auth.user.role === "super_admin",
          then: (schema) => schema.required("Manager is required!"),
          otherwise: (schema) => schema.notRequired(),
        }),
      lead_id: yup
        .object({
          value: yup.string().required(),
          label: yup.string().required(),
        })
        .required("Lead is required!"),
      sme_id: yup
        .object({
          value: yup.string().required(),
          label: yup.string().required(),
        })
        .when([], {
          is: () => auth.user.role === "project_head",
          then: (schema) => schema.required("SME is required!"),
          otherwise: (schema) => schema.notRequired(),
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        project_id: values.project_id?.value || null,
        lead_id: values.lead_id?.value || null,
        manager_id: values.manager_id?.value || null,
        project_head_id: values.project_head_id?.value || null,
        sme_id: values.sme_id?.value || null,
        coder_id: values.coder_id?.map((c) => c.value) || [],
        auditor_id: values.auditor_id?.map((a) => a.value) || [],
      };
      await mutation.mutateAsync(payload);
      resetForm();
      setSearchQueries({});
      setOpenTeamAccordion(false);
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      apiClient.post("teams", values, { componentName: "addTeam" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["getTeams"]);
      formik.resetForm();
    },
    onError: (err) => {
      if (err.response?.data?.errors) {
        formik.setErrors(err.response.data.errors);
      }
    },
  });

  const handleInputChange = useDebouncedCallback((val, name) => {
    setSearchQueries((prev) => ({ ...prev, [name]: val }));
  }, 500);

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
    option: (base, state) => ({
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

  const CheckboxOption = (props) => (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{ marginRight: 8 }}
      />
      <label>{props.label}</label>
    </components.Option>
  );

  return (
    <div className="card darkcard cus-card team-form">
      <div className="card-body font-size13">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <Collapse in={openTeamAccordion}>
            <div className="row mt-2 px-lg-2">
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
                  <div className="col-lg-3 px-1 mb-2" key={name}>
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
                      onBlur={() => formik.setFieldTouched(name, true)}
                      components={
                        isMulti ? { Option: CheckboxOption } : undefined
                      }
                    />
                    {formik.touched[name] && formik.errors[name] && (
                      <div className="invalid-feedback">
                        {formik.errors[name]}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="col-lg-3 d-flex align-items-end justify-content-start px-1 mb-2">
                <button
                  type="submit"
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <span>Loading...</span> : "Add Team"}
                  <FaArrowRight className="ms-2" />
                </button>
              </div>
            </div>
          </Collapse>
        </form>
      </div>
    </div>
  );
};

export default AddTeam;
