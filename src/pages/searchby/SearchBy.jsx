import { useContext, useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import { FaArrowRight } from "react-icons/fa6";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import ReactTable from "../../components/ReactTable";
import SearchByCoderColumns from "./SearchByCoderColumns";
import SearchByAuditorColumns from "./SearchByAuditorColumns";
import SearchByLoginColumns from "./SearchByLoginColumns";
import SearchByCoderColumnsR from "./SearchByCoderColumnsR";
import SearchByAuditorColumnsR from "./SearchByAuditorColumnsR";
import { UserContext } from "../../UserContext/UserContext";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import DeletedCoderColumns from "./DeleteCoderColumns";
import DeletedAuditorColumns from "./DeleteAuditorColumns";
import SearchByCoderColumnsAnthem from "./searchByCoderColumnsAnthem";
import SearchByAuditorColumnsAnthem from "./SearchByAuditorColumnsAnthem";
import SearchByCoderColumnsHumana from "./searchByCoderColumnsHumana";
import SearchByAuditorColumnsHumana from "./SearchByAuditorColumnsHumana";

const SearchBy = () => {
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemElevance = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const humanaProjectID = Number(import.meta.env.VITE_APP_HUMANA);
  const libertyProjectID = Number(import.meta.env.VITE_APP_LIBERTY);
  const prominenceProjectID = Number(import.meta.env.VITE_APP_PROMINENCE);
  const humanaWave2ProjectID = Number(import.meta.env.VITE_APP_HUMANA_WAVE_2);

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("search");
  const { theme } = useContext(UserContext);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");

  // For DisabledCoderCharts table
  const [coderPage, setCoderPage] = useState(1);
  const [coderPerPage, setCoderPerPage] = useState(10);
  const [coderSortType, setCoderSortType] = useState("");
  const [coderSortColumn, setCoderSortColumn] = useState("");

  // For DeletedAuditorCharts table
  const [auditorPage, setAuditorPage] = useState(1);
  const [auditorPerPage, setAuditorPerPage] = useState(10);
  const [auditorSortType, setAuditorSortType] = useState("");
  const [auditorSortColumn, setAuditorSortColumn] = useState("");

  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const { data: projectID } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: getProjectID,
    staleTime: 5 * 60 * 1000,
  });
  const [getData, setData] = useState([]);

  const fetchWithParams = async ({ search_term, value }) => {
    if (search_term === "login_email") {
      if (!value) return [];

      const response = await apiClient.get(`user-login/search/${value}`);
      setData(response.data);
      return response.data;
    }

    const isNumeric = /^\d+$/.test(value); // true if only digits

    const params = {
      search_term: isNumeric ? "chart_id" : "chart_uid",
      value,
      team_id: projectID?.data.team_id,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );

    if (Object.keys(params).length === 0) return [];

    if (search_term === "chart_id") {
      // coder search
      const response = await apiClient.get("coder-chart", { params });
      setData(response.data);
      return response.data;
    } else if (search_term === "aud_chart_id") {
      // auditor search
      const response = await apiClient.get("auditor-chart", { params });
      setData(response.data);
      return response.data;
    } else {
      // fallback
      const response = await apiClient.get("user-login/search", { params });
      setData(response.data);
      return response.data;
    }
  };

  const searchMutation = useMutation({
    mutationFn: fetchWithParams,
    onSuccess: (data) => {
      setHasSearched(true);
      queryClient.setQueryData(
        ["searchResults", page, perPage, search, sortColumn, sortType],
        data
      );
    },
  });
  const { data } = useQuery({
    queryKey: ["searchResults", page, perPage, search, sortColumn, sortType],
    queryFn: () => [],
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const formik = useFormik({
    initialValues: {
      search_term: "",
      value: "",
    },
    validationSchema: yup.object({
      search_term: yup.string().required("Search value is required!"),
      value: yup.string().when("search_term", {
        is: "login_email",
        then: (schema) =>
          schema.email("Enter a valid email!").required("Email is required!"),
        otherwise: (schema) =>
          schema
            // .matches(/^\d+$/, "Must be a number!")
            .required("Value is required!"),
      }),
    }),
    onSubmit: async (values) => {
      setSubmittedSearchTerm(values.search_term);
      await searchMutation.mutateAsync(values);
    },
  });

  const searchByOptions = [
    { label: "Coder Chart", value: "chart_id" },
    { label: "Auditor Chart", value: "aud_chart_id" },
    { label: "Login Email", value: "login_email" },
  ];

  const staticDropdowns = [
    {
      name: "search_term",
      label: "Search By",
      options: searchByOptions,
      isMulti: false,
      isMandatory: true,
    },
  ];
  const [getchartid, setChartId] = useState("");
  const team_id = projectID?.data.team_id;
  const getAPI = projectID?.data?.this_project;

  useEffect(() => {
    if (getData?.data) {
      getData.data.map((item) => setChartId(item.project_name));
    }
  }, [getData, getchartid]);

  const humanaProjects = [
    humanaProjectID,
    libertyProjectID,
    humanaWave2ProjectID,
    prominenceProjectID,
  ];
  const tableColumns = useMemo(() => {
    if (submittedSearchTerm === "chart_id") {
      if (humanaProjects.includes(projectID?.data.this_project)) {
        return SearchByCoderColumnsHumana({ search });
      }

      if (getAPI == anthemElevance) {
        return SearchByCoderColumnsAnthem({ search });
      }
      return getAPI == clientR
        ? SearchByCoderColumnsR({ search })
        : SearchByCoderColumns({ search });
    }

    if (submittedSearchTerm === "aud_chart_id") {
      if (humanaProjects.includes(projectID?.data.this_project)) {
        return SearchByAuditorColumnsHumana({ search });
      }
      if (getAPI == anthemElevance) {
        return SearchByAuditorColumnsAnthem({ search });
      }
      return getAPI == clientR
        ? SearchByAuditorColumnsR({ search })
        : SearchByAuditorColumns({ search });
    }

    if (submittedSearchTerm === "login_email") {
      return SearchByLoginColumns({ search });
    }

    return [];
  }, [
    submittedSearchTerm,
    getchartid,
    search,
    clientR,
    anthemElevance,
    humanaProjectID,
    libertyProjectID,
    prominenceProjectID,
    humanaWave2ProjectID,
  ]);

  //detetedcoderchart - data
  const getDeletedCoder = async () => {
    let params = {
      page: coderPage,
      perPage: coderPerPage,
      search: search,
      sortOrder: coderSortType,
      sortBy: coderSortColumn,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );

    const response = await apiClient.get(`inactive-coder-charts`, { params });
    return response.data;
  };

  const { data: deleteCoderData } = useQuery({
    queryKey: [
      "disabledCoderCharts",
      coderPage,
      coderPerPage,
      search,
      coderSortType,
      coderSortColumn,
    ],
    queryFn: getDeletedCoder,
    staleTime: 5 * 60 * 1000,
  });

  const tableColumnsData = useMemo(
    () => DeletedCoderColumns({ search }),
    [search]
  );

  //detetedauditorchart - data
  const getDeletedAuditor = async () => {
    let params = {
      page: auditorPage,
      perPage: auditorPerPage,
      search: search,
      sortOrder: auditorSortType,
      sortBy: auditorSortColumn,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined ||
          params[key] === null ||
          params[key] === "") &&
        delete params[key]
    );

    const response = await apiClient.get("inactive-auditor-charts", { params });
    return response.data;
  };

  const { data: deleteAuditorData } = useQuery({
    queryKey: [
      "deletedAuditorCharts",
      auditorPage,
      auditorPerPage,
      search,
      auditorSortType,
      auditorSortColumn,
    ],
    queryFn: getDeletedAuditor,
    staleTime: 5 * 60 * 1000,
  });

  const tableAuditorColumns = useMemo(
    () => DeletedAuditorColumns({ search }),
    [search]
  );

  return (
    <div className="container-fluid overflow-y-auto px-3 py-2">
      <Tabs
        id="disabled-and-search-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="darkcard rounded-3 mb-3 border-none"
      >
        {/* SEARCH TAB */}
        <Tab eventKey="search" title="Search">
          <div className="pt-3">
            <div className="card cus-card darkcard">
              <div className="card-body">
                <form onSubmit={formik.handleSubmit} autoComplete="off">
                  <div className="row gy-2">
                    {staticDropdowns.map(
                      ({ name, label, options, isMulti, isMandatory }) => (
                        <div className="col-lg-3" key={name}>
                          <label
                            htmlFor={name}
                            className={`form-label ${
                              isMandatory ? "required" : ""
                            }`}
                          >
                            {label}
                          </label>
                          <Select
                            classNamePrefix="custom-select"
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
                                    (option) =>
                                      option.value === formik.values[name]
                                  ) || null
                            }
                            onChange={(selectedOption) => {
                              formik.setFieldValue(
                                name,
                                isMulti
                                  ? selectedOption.map((opt) => opt.value)
                                  : selectedOption?.value || ""
                              );

                              // Also update your React state here:
                              setSelectedOption(selectedOption);
                            }}
                          />
                          {formik.touched[name] && formik.errors[name] && (
                            <div className="invalid-feedback">
                              {formik.errors[name]}
                            </div>
                          )}
                        </div>
                      )
                    )}

                    <div className="col-lg-3">
                      {selectedOption?.label === "Login Email" ? (
                        <label
                          htmlFor="searchValue"
                          className="form-label required"
                        >
                          Enter Email
                        </label>
                      ) : (
                        <label
                          htmlFor="searchValue"
                          className="form-label required"
                        >
                          Enter Value
                        </label>
                      )}
                      <input
                        type="text"
                        name="value"
                        id="searchValue"
                        className={`form-control font-size13 custom-inputborder ${
                          formik.touched.value && formik.errors.value
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter value"
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldTouched("value", true, false);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.value}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedValue = e.clipboardData
                            .getData("text")
                            .trim();
                          formik.setFieldValue("value", pastedValue);
                        }}
                      />
                      {formik.touched.value && formik.errors.value && (
                        <div className="invalid-feedback">
                          {formik.errors.value}
                        </div>
                      )}
                    </div>

                    <div className="col-lg-3 mt-4 py-3">
                      <div className="d-flex ">
                        <button
                          type="submit"
                          className="btn btn-primary add-client-btn custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center "
                          disabled={searchMutation.isPending}
                        >
                          {searchMutation.isPending ? (
                            <span>Loading...</span>
                          ) : (
                            "Search"
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
            <div className="table-section darkcard mt-3 search-table">
              <div className="tableparent px-3 pb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 table-header-pdng">
                  <div className="search-body pt-1 overflow-y-auto w-100">
                    {data?.data?.length > 0 ? (
                      <ReactTable
                        data={data || []}
                        columns={tableColumns}
                        apiEndPoint=""
                        queryKey="searchResults"
                        search={search}
                        setSearch={setSearch}
                        page={page}
                        setPage={setPage}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        isLoading={searchMutation.isPending}
                        setSortType={setSortType}
                        setSortColumn={setSortColumn}
                        sortType={sortType}
                        sortColumn={sortColumn}
                        IdendifyChart_id={formik.values.search_term}
                        chart_id={
                          formik.values.search_term === "chart_id"
                            ? formik.values.value
                            : formik.values.search_term === "aud_chart_id" &&
                              formik.values.value
                        }
                        team_id={team_id}
                        clearFormikValues={() => {
                          formik.setFieldValue("search_term", "");
                          formik.setFieldValue("value", "");
                        }}
                      />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center text-center w-100">
                        <p
                          style={{
                            color: theme === "dark" ? "#fff" : "grey",
                          }}
                        >
                          No Data Found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        <Tab eventKey="DisabledCoder" title="Disabled Coder Charts">
          <div className="table-section darkcard mt-3 search-table">
            <div className="tableparent px-3 pb-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 table-header-pdng">
                <div className="errorchart-head ">
                  <span className=" t-title">Disabled Coder Charts</span>
                  {deleteCoderData?.pagination?.total ? (
                    <span className="cus-count ms-2">
                      {deleteCoderData?.pagination?.total}
                    </span>
                  ) : null}
                </div>

                <div className="search-body pt-1 overflow-y-auto">
                  <ReactTable
                    data={deleteCoderData || []}
                    columns={tableColumnsData}
                    apiEndPoint=""
                    queryKey="deletedAuditorCharts"
                    search={search}
                    setSearch={setSearch}
                    page={coderPage}
                    setPage={setCoderPage}
                    perPage={coderPerPage}
                    setPerPage={setCoderPerPage}
                    sortType={coderSortType}
                    sortColumn={coderSortColumn}
                    setSortType={setCoderSortType}
                    setSortColumn={setCoderSortColumn}
                  />
                </div>
              </div>
            </div>
          </div>
        </Tab>

        <Tab eventKey="DisabledAuditor" title="Disabled Auditor Charts">
          <div className="table-section darkcard mt-3 search-table ">
            <div className="tableparent px-3 pb-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 table-header-pdng">
                <div className="errorchart-head ">
                  <span className=" t-title">Disabled Auditor Charts</span>
                  {deleteAuditorData?.pagination?.total ? (
                    <span className="cus-count ">
                      {deleteAuditorData?.pagination?.total}
                    </span>
                  ) : null}
                </div>

                <div className="search-body pt-1 overflow-y-auto">
                  <ReactTable
                    data={deleteAuditorData || []}
                    columns={tableAuditorColumns}
                    apiEndPoint=""
                    queryKey="disabledAuditorCharts"
                    search={search}
                    setSearch={setSearch}
                    page={auditorPage}
                    setPage={setAuditorPage}
                    perPage={auditorPerPage}
                    setPerPage={setAuditorPerPage}
                    sortType={auditorSortType}
                    sortColumn={auditorSortColumn}
                    setSortType={setAuditorSortType}
                    setSortColumn={setAuditorSortColumn}
                  />
                </div>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SearchBy;
