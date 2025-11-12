import { useState, useRef, useMemo, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as yup from "yup";
import { useLocation } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { FaArrowRight } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";
import { changeTabTitle } from "../../utils/changeTabTitle";
import ReactTable from "../../components/ReactTable";
import ClientBulkUploadColumns from "./ClientBulkUploadColumns";
import ProjectBulkUploadColumns from "./ProjectBulkUploadColumns";
import LoginBulkUploadColumns from "./LoginsBulkUpload";
import UserBulkUploadColumns from "./UserBulkUploadColumns";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";
import DropdownOptions from "../../components/DropdownOptions";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";
import { UserContext } from "../../UserContext/UserContext";

const BulkUpload = () => {
  changeTabTitle("Bulk Upload");

  const location = useLocation();
  const module = location.pathname.split("/")[1];
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const fileInputRef = useRef(null);
  const [optionSearchQuery, setOptionSearchQuery] = useState("");

  const dropdownEndpoints = {
    client_id: module === "projects" ? "clients/dropdown" : "",
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
      apiClient.post(`${module}/import`, values, {
        componentName: "bulkUpload",
      }),
    // onSuccess: () => {
    //     queryClient.invalidateQueries([`${module}`]);
    // },
    // onError: (err) => {
    //     if (err.response?.data?.errors) {
    //         formik.setErrors(err.response.data.errors);
    //     }
    // },
  });

  const formik = useFormik({
    initialValues: {
      client_id: "",
      file: null,
    },
    validationSchema: yup.object({
      client_id: yup.string().when([], {
        is: () => module === "projects",
        then: (schema) => schema.required("Client is required !"),
        otherwise: (schema) => schema.notRequired(),
      }),
      file: yup.mixed().required("File is required !"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("file", values.file);
      if (module === "projects") {
        formData.append("client_id", values.client_id);
      }

      await mutation.mutateAsync(formData, {
        onSuccess: async () => {
          queryClient.invalidateQueries([`${module}`]);
          formik.resetForm();
          formik.setFieldValue("file", null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: () => {
          formik.setFieldValue("file", null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      });
      resetForm();
      setOptionSearchQuery("");
    },
  });
  const getBulkData = async () => {
    try {
      let params = {
        page: page,
        perPage: perPage,
        search: search,
        sortOrder: sortType,
        sortBy: sortColumn,
      };

      const response = await apiClient.get(`${module}/import`, {
        params: { ...params },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  const { data, isLoading } = useQuery({
    queryKey: ["getBulkData", page, perPage, search, sortType, sortColumn],
    queryFn: getBulkData,
    staleTime: 5 * 60 * 1000,
  });

  const handleFileChange = (event) => {
    formik.setFieldValue("file", event.currentTarget.files[0]);
  };
  const handleStore = async () => {
    try {
      await apiClient.post(`${module}/import-store`, null, {
        componentName: "storePreviewData",
      });
      queryClient.invalidateQueries(["getBulkData"]);
    } catch (error) {
      console.error("Store failed:", error);
    }
  };
  const sampleTemplate = async () => {
    try {
      const response = await apiClient.get(`/${module}-import/template`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${module}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  let tableColumns = useMemo(() => {
    if (module === "clients") return ClientBulkUploadColumns({ search });
    if (module === "projects") return ProjectBulkUploadColumns({ search });
    if (module === "users") return UserBulkUploadColumns({ search });
    if (module === "logins") return LoginBulkUploadColumns({ search });
    return [];
  }, [search, module]);

  return (
    <div className="container-fluid ">
      <div className=" d-flex justify-content-between align-items-center mx-3 my-2">
        <h5 className="t-title">{module.slice(0, -1)} Bulk Upload</h5>
        <Link className="text-decoration-none" to={`/${module}`}>
          <OverlayTrigger
            overlay={<Tooltip className="text-cap">Back</Tooltip>}
            container={this}
            placement="left"
          >
            <button className="btn btn-primary custom-primary-btn back-btn font-size13 ">
              <IoMdArrowRoundBack className="fs-5" />
            </button>
          </OverlayTrigger>
        </Link>
      </div>
      <div className="card cus-card darkcard">
        <div className="card-body d-flex justify-content-between">
          <form
            className="w-100"
            onSubmit={formik.handleSubmit}
            autoComplete="off"
          >
            <div className="row align-items-end justify-content-start gy-2 px-2 ">
              {module === "projects" ? (
                <>
                  <div className="col-lg-3">
                    {dropdownFields.map(
                      ({ name, label, isMulti, isMandatory }) => {
                        const {
                          data,
                          fetchNextPage,
                          hasNextPage,
                          isFetchingNextPage,
                        } = dropdowns[name];
                        const options =
                          data?.pages?.reduce(
                            (acc, page) => [...acc, ...page.data],
                            []
                          ) || [];
                        return (
                          <div key={name}>
                            <label
                              htmlFor={name}
                              className={`form-label ${isMandatory === true ? "required" : ""
                                }`}
                            >
                              Client
                            </label>
                            <Select
                              // styles={customStyles(theme)}
                              classNamePrefix="custom-select"
                              className={` font-size13 ${formik.touched.client_id &&
                                formik.errors.client_id &&
                                "is-invalid"
                                }`}
                              // classNamePrefix="select"
                              isMulti={isMulti}
                              isSearchable
                              name={name}
                              options={options}
                              value={
                                isMulti
                                  ? options.filter((option) =>
                                    formik.values[name]?.includes(
                                      option.value
                                    )
                                  )
                                  : options.find(
                                    (option) =>
                                      option.value === formik.values[name]
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
                            {formik.touched.client_id &&
                              formik.errors.client_id ? (
                              <div id="role" className="invalid-feedback">
                                {formik.errors.client_id}
                              </div>
                            ) : (
                              <div className="invisible">
                                <span>invisible</span>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </>
              ) : (
                ""
              )}

              <div className="col-lg-6">
                <label htmlFor="File" className="form-label">
                  File
                </label>
                <input
                  type="file"
                  className={`form-control font-size13 custom-inputborder  ${formik.touched.file && formik.errors.file && "is-invalid"
                    }`}
                  id="File"
                  name="file"
                  onChange={handleFileChange}
                  onBlur={formik.handleBlur}
                  accept=".xls,.xlsx, .csv"
                  ref={fileInputRef}
                />
                {formik.touched.file && formik.errors.file ? (
                  <div id="role" className="invalid-feedback">
                    {formik.errors.file}
                  </div>
                ) : (
                  <div className="invisible">
                    <span>invisible</span>
                  </div>
                )}
              </div>
              <div className="col-lg-3  w-auto">
                <div className="d-flex">
                  <button
                    type="submit"
                    className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <span>Loading...</span>
                    ) : (
                      `Add ${module}`
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
          <OverlayTrigger
            overlay={
              <Tooltip className="text-cap">
                Click here to download the sample template
              </Tooltip>
            }
            container={this}
            placement="left"
          >
            <FaDownload onClick={sampleTemplate} />
          </OverlayTrigger>
        </div>
      </div>
      <div className="table-section darkcard mt-3 client-table ">
        <div className="tableparent px-3 pb-3">
          <div className="d-flex justify-content-between align-items-end flex-wrap flex-md-wrap flex-sm-wrap gap-md-3 gap-sm-3 gap-3 table-header-pdng client-header ">
            <div className="d-flex gap-3 justify-start_md align-items-center left-flex-basic">
              <div className="t-title">
                <span>
                  {data?.pagination?.total > 1 ? module : module.slice(0, -1)}
                </span>
                {data?.pagination?.total ? (
                  <>
                    <span className="cus-count ms-2">
                      {data?.pagination?.total}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="d-flex gap-3 justify-end_md align-items-center right-flex-basic">
              <div className="col-lg-3  w-auto">
                {data?.pagination?.total ? (
                  <div className="d-flex">
                    <button
                      type="button"
                      className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center"
                      disabled={mutation.isPending || data?.data.length === 0}
                      onClick={handleStore}
                    >
                      {mutation.isPending ? <span>Loading...</span> : "Store"}
                      <FaArrowRight className="ms-2" />
                    </button>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
          <div className="client-body pt-1">
            <ReactTable
              data={data}
              columns={tableColumns}
              apiEndPoint={`${module}/import`}
              queryKey={"getBulkData"}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              perPage={perPage}
              setPerPage={setPerPage}
              isLoading={isLoading}
              setSortType={setSortType}
              setSortColumn={setSortColumn}
              sortType={sortType}
              sortColumn={sortColumn}
              tableHeight={"88%"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
