/** @format */

import { Fragment, useContext, useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import ReactPaginate from "react-paginate";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { IoCaretDownOutline, IoCaretUpOutline } from "react-icons/io5";
import { FaSort } from "react-icons/fa";
import { FaAngleLeft, FaArrowRightLong } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BiSave } from "react-icons/bi";
import { RiCloseCircleLine } from "react-icons/ri";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalComp from "./ModalComp";
import { NoData } from "../shared/NoData";
import { useAuth } from "../../src/context/AuthContext";
import { FaCaretDown, FaCaretUp, FaHandPointRight } from "react-icons/fa6";
import { formatDate } from "../utils/formatDate";
import Select from "react-select";
import DropdownOptions from "./DropdownOptions";
import { useDebouncedCallback } from "use-debounce";
import PostPayloadDelete from "../pages/guidelines/PostPayloadDelete";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Loader } from "../shared/Loader";
import { useLocation } from "react-router";
import { UserContext } from "../UserContext/UserContext";

const ReactTable = ({
  columns,
  data,
  apiEndPoint,
  queryKey,
  page,
  setPage,
  perPage,
  setPerPage,
  isLoading,
  setSortType,
  setSortColumn,
  sortType,
  sortColumn,
  search,
  from,
  team_id,
  chart_id,
  IdendifyChart_id,
  tableHeight,
  // getValues,
  // currentSearchTerm,
  clearFormikValues,
}) => {
  const auth = useAuth();
  const clientR = Number(import.meta.env.VITE_APP_CLIENTR);
  const anthemElevance = Number(import.meta.env.VITE_APP_ANTHEM_ELEVANCE);
  const humana = Number(import.meta.env.VITE_APP_HUMANA);
  //  const humanaProjectID = Number(import.meta.env.VITE_APP_HUMANA);
  const libertyProjectID = Number(import.meta.env.VITE_APP_LIBERTY);
  const prominenceProjectID = Number(import.meta.env.VITE_APP_PROMINENCE);
  const humanaWave2ProjectID = Number(import.meta.env.VITE_APP_HUMANA_WAVE_2);

  const [expanded, setExpanded] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [goToPage, setGoToPage] = useState("");
  const [projectID, setProjectID] = useState(null);
  const [chartID, setChartID] = useState(null);
  const [chartUID, setChartUID] = useState(null);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [PostPayloadDeleteopen, setPostPayloadDeleteOpen] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const queryClient = useQueryClient();
  const [optionSearchQuery, setOptionSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [auditMode, setAuditMode] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [optionSearchQueries, setOptionSearchQueries] = useState({});

  const roleFromQuery = queryParams.get("role_id");
  const locationFromQuery = queryParams.get("location_id");

  const dropdownColumns = columns.filter((col) => col.type === "dropdown");
  const dropdownsEdit = useMemo(() => {
    return dropdownColumns.reduce((acc, col) => {
      const field = col.payloadKey;
      let endpoint = col.endPoint;
      if (auth.user.role === "coder" && field === "sub_project_id") {
        endpoint = selectedProjectId
          ? `${col.endPoint}/${selectedProjectId}`
          : null;
      }

      acc[col.accessorKey] = DropdownOptions(
        endpoint,
        field,
        optionSearchQueries[field] || "",
        selectedProjectId
      );

      return acc;
    }, {});
  }, [dropdownColumns, optionSearchQueries, selectedProjectId, auth.role]);

  const handleInputChange = useDebouncedCallback((inputValue, fieldName) => {
    setOptionSearchQueries((prev) => ({
      ...prev,
      [fieldName]: inputValue,
    }));
  }, 500);

  const mutation = useMutation({
    mutationFn: (values) => {
      return apiClient.post(`${apiEndPoint}/${values?.id}`, values, {
        componentName: "addClient",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      //   formik.resetForm();
    },
    onError: (err) => {
      if (err.response?.data?.error) {
        // formik.setErrors(err.response.data.error);
      }
    },
  });

  const handlePageClick = ({ selected: selectedPage }) => {
    setPage(selectedPage + 1);
  };
  const handlePerPageChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : null;
    if (value !== null) {
      setPerPage(value);
      setPage(1);
      setGoToPage("");
    }
  };

  const handleGoToPageChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and empty string (to reset)
    if (/^\d*$/.test(value)) {
      setGoToPage(value);
    }
  };

  const handleGoToPageSubmit = () => {
    const pageNum = parseInt(goToPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPage) {
      setPage(pageNum);
      setGoToPage("");
    }
  };

  const handleEdit = (row) => {
    setProjectID(row.project_id);
    setChartID(row.chart_id);
    // setChartUID(row.chart_uid);
    setAuditMode(row.audit_mode);
    setEditingRowId(row.id); // Set the row being edited
    setSelectedProjectId(row.project_id);
    // formik.setValues(row); // Pre-fill the form with the row's data
    formik.setValues({
      ...row,
      file_name: row.chart_uid,
    });
  };
  // const project_name = projectID

  let getenvprojectID = null;

  if (projectID == humana) {
    getenvprojectID = humana;
  } else if (projectID == libertyProjectID) {
    getenvprojectID = libertyProjectID;
  } else if (projectID == prominenceProjectID) {
    getenvprojectID = prominenceProjectID;
  } else if (projectID == humanaWave2ProjectID) {
    getenvprojectID = humanaWave2ProjectID;
  } else {
    getenvprojectID = "";
  }

  let tableData = useMemo(() => (data?.data ? data?.data : []), [data?.data]);
  const formik = useFormik({
    initialValues: {}, // Dynamically set when entering edit mode
    validationSchema: Yup.object().shape(
      columns
        // .filter((col) => col.editable)
        .reduce((acc, col) => {
          if (col.accessorKey === "comments") {
            acc[col.accessorKey] = Yup.string()
              .nullable()
              .when("action", {
                is: (val) =>
                  (val === "Rejected" || val === "SAR") &&
                  data.data.this_project !== clientR,
                then: () =>
                  Yup.string().required(
                    "Comments are required when action is Rejected or SAR"
                  ),
                otherwise: () => Yup.string().nullable(),
              });
          } else if (col.type === "number") {
            acc[col.accessorKey] = Yup.number()
              .typeError(`${col.header} must be a number`)
              .required(`${col.header} is required!`);
          }
          // else {
          //   acc[col.accessorKey] = Yup.string().required(
          //     `${col.header} is required!`
          //   );
          // }
          return acc;
        }, {})
    ),

    onSubmit: async () => {
      try {
        const editableFields = columns.filter((col) => col.editable);
        const payload = editableFields.reduce(
          (acc, col) => {
            const value =
              formik.values[
                col.type === "dropdown" ? col.payloadKey : col.accessorKey
              ];
            if (value !== undefined) {
              acc[col.type === "dropdown" ? col.payloadKey : col.accessorKey] =
                value;
            }
            return acc;
          },
          {
            id: editingRowId,
            project_id: projectID,
            audit_mode: auditMode,
            file_name: formik.values.chart_uid,
            ...(chartID != null ? { chart_id: chartID } : {}),
            ...(formik.values.chart_uid != null
              ? getenvprojectID != projectID
                ? { chart_uid: formik.values.chart_uid }
                : { file_name: formik.values.chart_uid }
              : {}),
          }
        );

        // Send the payload to the API
        if (
          (getenvprojectID == projectID && payload.chart_uid) ||
          auth.user.role === "auditor" ||
          ("coder" && payload.chart_uid)
        ) {
          delete payload.chart_uid;
        }
        await mutation.mutateAsync(payload);

        setEditingRowId(null); // Exit edit mode after saving
        setProjectID(null);
        setChartID(null);
        setChartUID(null);
      } catch (error) {
        // console.error("Error updating data:", error);
        if (error.response?.data?.errors) {
          formik.setErrors(error.response.data.errors);
        }
      }
    },
  });

  const handleCancel = () => {
    setEditingRowId(null); // Exit edit mode
    formik.resetForm(); // Reset the form
  };
  const handleDelete = (row) => {
    setChartID(row?.id);
    setChartUID(row?.id);
    handleShowDeleteModal();
    setDeleteRow(row);
  };

  const handleSortingChange = (columnId) => {
    setSortColumn((prevColumn) => {
      if (prevColumn === columnId) {
        // Toggle sorting direction
        setSortType((prevSortType) => {
          if (prevSortType === "asc") return "desc"; // Ascending -> Descending
          if (prevSortType === "desc") {
            setSortColumn(""); // Reset the sortColumn when sorting is cleared
            return ""; // Descending -> No sorting
          }
          return "asc"; // No sorting -> Ascending
        });
      } else {
        // New column, start with ascending sort
        setSortType("asc");
      }
      return prevColumn === columnId && sortType === "desc" ? "" : columnId;
    });
  };
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded },
    onExpandedChange: setExpanded,
  });

  const totalPage = data?.pagination?.last_page;
  const totalCount = data?.pagination?.total;

  const getProjectID = async () => {
    const response = await apiClient.get("get-current-user-data");
    return response.data;
  };

  const { data: getAction } = useQuery({
    queryKey: ["getProjectID"],
    queryFn: auth.user.role === "coder" && getProjectID,
    staleTime: 5 * 60 * 1000,
  });
  const customStyles = (theme) => ({
    control: (base, state) => ({
      ...base,
      minWidth: "fit-content",
      width: "fit-content",
      borderRadius: "10px",
      borderColor: theme === "dark" ? "#888" : "#63606094",
      backgroundColor: theme === "dark" ? "#23272F" : "#fff",
      color: "#FFFFFF",
      outline: "none",
      boxShadow: state.isFocused ? "#33B1FF" : "none",
      "&:hover": {
        borderColor: "#33B1FF",
        cursor: "pointer",
      },
    }),

    menu: (base) => ({
      ...base,
      minWidth: "fit-content",
      width: "fit-content", // Ensures dropdown list matches content size
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#33B1FF"
        : state.isFocused
          ? theme === "dark"
            ? "#3b3f4b"
            : "#E9F9F7"
          : theme === "dark"
            ? "#2f3135"
            : "white",
      color: state.isSelected
        ? "white"
        : theme === "dark"
          ? "#f0f0f0"
          : "black",
      cursor: "pointer",
      whiteSpace: "nowrap", // Prevents wrapping
    }),

    placeholder: (base) => ({
      ...base,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
      fontSize: "13px",
    }),

    singleValue: (base) => ({
      ...base,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      backgroundColor: "#fff",
      color: "#000",
      padding: 10,
      fontSize: "14px",
      fontWeight: "bold",
      // borderRadius: "4px",
      textAlign: "center",
      // padding: "10px !important",
      ...(theme === "dark" && {
        backgroundColor: "#222",
        color: "#fff",
      }),
    }),
  });

  const options = [
    { value: 10, label: "10" },
    { value: 20, label: "20" },
  ];

  const customSelectStyles = (theme) => ({
    control: (base, state) => ({
      ...base,
      width: "auto", // adapt to content
      minWidth: 50, // avoid too small
      borderRadius: 8,
      borderColor:
        state.isFocused || state.isHovered
          ? "#33B1FF"
          : theme === "dark"
            ? "#888"
            : "#63606094",
      backgroundColor: theme === "dark" ? "#23272F" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      boxShadow: state.isFocused ? " #33B1FF" : "none",
      cursor: "pointer",
      paddingRight: 4,
      paddingLeft: 4,
      "&:hover": {
        borderColor: "#33B1FF",
      },
      minHeight: 30,
    }),

    dropdownIndicator: (base) => ({
      ...base,
      padding: 2,
      svg: { width: 12, height: 12 },
    }),

    indicatorsContainer: (base) => ({
      ...base,
      padding: 0,
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 4px",
    }),

    singleValue: (base) => ({
      ...base,
      fontSize: 13,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
      margin: 0,
    }),

    placeholder: (base) => ({
      ...base,
      fontSize: 13,
      color: theme === "dark" ? "#FFFFFF" : "#000000",
    }),

    option: (base, { isSelected, isFocused }) => ({
      ...base,
      width: "auto",
      backgroundColor: isSelected
        ? "#33B1FF"
        : isFocused
          ? theme === "dark"
            ? "#3b3f4b"
            : "#E9F9F7"
          : theme === "dark"
            ? "#2f3135"
            : "#fff",
      color: isSelected ? "#fff" : theme === "dark" ? "#f0f0f0" : "#000",
      cursor: "pointer",
      fontSize: 13,
      padding: "6px 8px",
    }),

    menu: (base) => ({
      ...base,
      width: "auto", // adapts to control width
      minWidth: 50,
    }),
  });

  const { theme } = useContext(UserContext);
  useEffect(() => {
    if (auth.role === "coder" && selectedProjectId) {
      setOptionSearchQueries((prev) => ({
        ...prev,
        sub_project_id: "",
      }));
    }
  }, [selectedProjectId, auth.role]);

  return (
    <>
      <div className="h-100">
        <div
          className="overflow-auto"
          style={{
            height: `${tableHeight}`,
            // overflow: "scroll",
          }}
        >
          <table className={`table`} border="1">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {queryKey !== "searchResults" && (
                    <th className="text-center py-2 ">S.No</th>
                  )}
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column.columnDef;
                    const isSortable = columnDef.enableSorting;

                    return (
                      <th
                        // className="text-wrap"
                        key={header.id}
                        style={{
                          width: `${columnDef?.width}px`,
                          ...(columnDef?.textWrap
                            ? {
                                // whiteSpace: "normal",
                                // wordBreak: "break-word",
                                textWrap: "wrap",
                              }
                            : {}),
                          ...(header.column.columnDef.stickyLeft !== undefined
                            ? {
                                position: "sticky",
                                left: `${header.column.columnDef.stickyLeft}px`,
                                background: "#F5F5F5",
                              }
                            : header.column.columnDef.stickyRight !== undefined
                              ? {
                                  position: "sticky",
                                  right: `${header.column.columnDef.stickyRight}px`,
                                  background: "#F5F5F5",
                                }
                              : header.column.columnDef.scrollKey === true
                                ? {
                                    backgroundColor: "#f3fafb",
                                    boxShadow:
                                      " 0px 4px 6px rgba(0, 0, 0, 0.1)",
                                  }
                                : {}),
                        }}
                        onClick={() => {
                          if (isSortable) {
                            const currentSort = header.column.getIsSorted();
                            const nextSort =
                              currentSort === "asc" ? "desc" : "asc";
                            handleSortingChange(header.column.id, nextSort);
                          }
                        }}
                      >
                        {!isSortable ? (
                          <>
                            {flexRender(columnDef.header, header.getContext())}
                          </>
                        ) : (
                          <div className="pointer">
                            {flexRender(columnDef.header, header.getContext())}
                            {isSortable &&
                              tableData?.length > 0 &&
                              (header.column.id === sortColumn ? (
                                sortType === "asc" ? (
                                  <IoCaretUpOutline />
                                ) : sortType === "desc" ? (
                                  <IoCaretDownOutline />
                                ) : (
                                  <FaSort />
                                )
                              ) : (
                                <FaSort />
                              ))}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center">
                    <Loader />
                  </td>
                </tr>
              ) : tableData.length <= 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="nodata-fullcell">
                    <div className="nodata-center">
                      <NoData />
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row?.original?.id}>
                    {/* Main row */}
                    <tr key={row?.original?.id}>
                      {queryKey !== "searchResults" && (
                        <td className="text-center">
                          {data?.pagination?.from + row?.index}
                        </td>
                      )}
                      {row.getVisibleCells().map((cell) => {
                        const columnId = cell.column.id;

                        const columnDef = columns.find(
                          (col) => col.accessorKey === columnId
                        );
                        const isEditable = columnDef?.editable;
                        const isEditing = editingRowId === row.original.id;
                        const showEdit = columnDef?.showEdit ?? true;
                        const showDelete = columnDef?.showDelete ?? true;
                        return (
                          <td
                            className="py-0 text-nowrap"
                            key={cell.id}
                            style={{
                              width: `${columnDef?.width}px`,
                              ...(columnDef?.stickyLeft !== undefined
                                ? {
                                    position: "sticky",
                                    left: `${cell.column.columnDef.stickyLeft}px`,
                                    backgroundColor: "white",
                                  }
                                : cell.column.columnDef?.stickyRight !==
                                    undefined
                                  ? {
                                      position: "sticky",
                                      right: `${columnDef.stickyRight}px`,
                                      backgroundColor: "white",
                                    }
                                  : cell.column.columnDef?.scrollKey === true
                                    ? {
                                        backgroundColor: "#f3fafb",
                                        boxShadow:
                                          "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                      }
                                    : {}),
                            }}
                          >
                            {columnId === "actions" &&
                            !row.original.is_chart_audited ? (
                              <>
                                <div className="actions-container">
                                  <div className="d-flex align-items-center">
                                    {showEdit &&
                                      (isEditing &&
                                      !row.original.is_chart_audited ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={formik.handleSubmit}
                                            disabled={
                                              !formik.dirty || !formik.isValid
                                            }
                                          >
                                            <BiSave className="bi-save" />
                                          </button>
                                          <button onClick={handleCancel}>
                                            <RiCloseCircleLine className="bi-cancel" />
                                          </button>
                                        </>
                                      ) : (
                                        (() => {
                                          const { role } = auth.user;
                                          const userRole =
                                            row.original.role_name;
                                          const editable =
                                            (![
                                              "getBulkData",
                                              "getCoderTab",
                                              "getAuditorTab",
                                              "getIdleUsers",
                                              "getArchivedUsers",
                                              "getAuditorProduction",
                                            ].includes(queryKey) &&
                                              queryKey === "getAuditors") ||
                                            ((queryKey !== "getGuidelines" ||
                                              (row.original.flag === 0 &&
                                                (role === "super_admin" ||
                                                  role === "sme"))) &&
                                              (queryKey !== "getTeams" ||
                                                [
                                                  "super_admin",
                                                  "manager",
                                                  "project_head",
                                                ].includes(role)) &&
                                              queryKey !== "getUsers" &&
                                              ((role === "super_admin" &&
                                                userRole !== "super_admin") ||
                                                (role === "manager" &&
                                                  ![
                                                    "super_admin",
                                                    "manager",
                                                  ].includes(userRole)) ||
                                                (role === "project_head" &&
                                                  ![
                                                    "super_admin",
                                                    "manager",
                                                    "project_head",
                                                  ].includes(userRole)) ||
                                                (role === "lead" &&
                                                  queryKey === "getLogins") ||
                                                // (role === "sme" &&
                                                //   queryKey ===
                                                //     "getGuidelines") ||
                                                (role === "coder" &&
                                                  row.original
                                                    .is_chart_audited ===
                                                    false)));

                                          if (
                                            !editable ||
                                            queryKey === "getCoderTab" ||
                                            queryKey === "getAuditorTab" ||
                                            (queryKey === "getGuidelines" &&
                                              role === "super_admin") ||
                                            queryKey === "getBulkData"
                                          )
                                            return null;
                                          return (
                                            <>
                                              {(role !== "lead" &&
                                                role !== "project_head" &&
                                                queryKey !== "searchResults") ||
                                              role === "lead" ||
                                              (role === "project_head" &&
                                                queryKey === "getLogins") ||
                                              (queryKey === "getUsers-all" &&
                                                row.original.created_by_name !==
                                                  "manager") ? (
                                                <OverlayTrigger
                                                  overlay={
                                                    <Tooltip className="text-cap">
                                                      Edit
                                                    </Tooltip>
                                                  }
                                                  container={this}
                                                  placement="bottom"
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleEdit(row.original)
                                                    }
                                                  >
                                                    <BiEdit className="bi-edit" />
                                                  </button>
                                                </OverlayTrigger>
                                              ) : (
                                                <OverlayTrigger
                                                  overlay={
                                                    <Tooltip className="text-cap">
                                                      Edit
                                                    </Tooltip>
                                                  }
                                                  placement="bottom"
                                                >
                                                  <div className="cursor-wrapper">
                                                    <button
                                                      type="button"
                                                      disabled
                                                      className={
                                                        "wrapper-not-allowed"
                                                      }
                                                    >
                                                      <BiEdit className="bi-edit" />
                                                    </button>
                                                  </div>
                                                </OverlayTrigger>
                                              )}
                                            </>
                                          );
                                        })()
                                      ))}
                                    {((auth.user.role === "super_admin" ||
                                      auth.user.role === "manager") &&
                                      queryKey === "getLogins") ||
                                    (auth.user.role === "project_head" &&
                                      queryKey === "disabledCoderCharts") ||
                                    ((auth.user.role === "coder" ||
                                      auth.user.role === "auditor" ||
                                      queryKey === "getIdleUsers" ||
                                      queryKey === "getCoderTab" ||
                                      queryKey === "getAuditorTab" ||
                                      (queryKey === "searchResults" &&
                                        (auth.user.role === "project_head" ||
                                          row.original.is_chart_audited ===
                                            false)) ||
                                      (queryKey !== "getUsers" &&
                                        ((auth.user.role === "super_admin" &&
                                          row.original.role_name !==
                                            "super_admin") ||
                                          (auth.user.role === "manager" &&
                                            ![
                                              "super_admin",
                                              "manager",
                                            ].includes(
                                              row.original.role_name
                                            )) ||
                                          (auth.user.role !== "project_head" &&
                                            ![
                                              "super_admin",
                                              "manager",
                                              "project_head",
                                            ].includes(
                                              row.original.role_name
                                            )) ||
                                          (auth.user.role === "lead" &&
                                            !["lead"].includes(
                                              row.original.role_name
                                            )))) ||
                                      (queryKey === "getArchivedUsers" &&
                                        showDelete) ||
                                      (queryKey === "getGuidelines" &&
                                        auth.user.role === "super_admin") ||
                                      (queryKey === "getUsers" &&
                                        auth.user.role === "lead") ||
                                      (auth.user.role === "lead" &&
                                        queryKey === "getBulkData")) &&
                                      !(
                                        auth.user.role === "lead" &&
                                        queryKey === "getLogins"
                                      ) &&
                                      !(
                                        auth.user.role === "project_head" &&
                                        queryKey === "getLogins"
                                      ) &&
                                      !(queryKey === "smefeedbackItems") &&
                                      !(queryKey === "feedbackItems") &&
                                      !(
                                        (auth.user.role === "lead" &&
                                          queryKey === "getUsers-all") ||
                                        queryKey === "getLogins" ||
                                        queryKey === "getGuidelines" ||
                                        queryKey === "getCharts" ||
                                        queryKey === "getAuditors"
                                      ) &&
                                      !(
                                        (auth.user.role === "manager" &&
                                          queryKey === "getSubProjects") ||
                                        ((queryKey === "getClients" ||
                                          queryKey === "getProjects") &&
                                          auth.user.role !== "super_admin") ||
                                        queryKey === "getCoderTab" ||
                                        queryKey === "getAuditorTab" ||
                                        (auth.user.role === "manager" &&
                                          queryKey === "getGuidelines") ||
                                        (queryKey === "getUsers-all-all" &&
                                          row.original.role_name ===
                                            "super_admin" &&
                                          row.original.created_by_name ===
                                            "manager")
                                      )) ||
                                    queryKey === "getBulkData" ? (
                                      // ||
                                      // (auth.user.role === "sme" &&
                                      //   queryKey === "getGuidelines")
                                      <>
                                        <OverlayTrigger
                                          overlay={
                                            <Tooltip className="text-cap">
                                              Delete
                                            </Tooltip>
                                          }
                                          container={this}
                                          placement="bottom"
                                        >
                                          <button
                                            onClick={() =>
                                              handleDelete(row?.original)
                                            }
                                          >
                                            <RiDeleteBin6Line className="bi-delete" />
                                          </button>
                                        </OverlayTrigger>
                                      </>
                                    ) : null}

                                    {/* this for the eye icon where we called from the column cells */}

                                    {columnDef?.cell &&
                                      (queryKey !== "getBulkData"
                                        ? columnDef.cell({ row })
                                        : "")}
                                  </div>
                                </div>
                              </>
                            ) : isEditing && isEditable ? (
                              columnDef?.type === "dropdown" ? (
                                columnDef.endPoint ? (
                                  (() => {
                                    const dropdownData =
                                      dropdownsEdit[columnDef.accessorKey];
                                    const {
                                      data: optionsData,
                                      fetchNextPage,
                                      hasNextPage,
                                      isFetchingNextPage,
                                    } = dropdownData || {};

                                    const options =
                                      optionsData?.pages?.flatMap(
                                        (page) => page.data
                                      ) || [];

                                    const selectedValues =
                                      formik.values[columnDef.payloadKey];
                                    const selectedOptions = columnDef.isMulti
                                      ? (selectedValues || []).map((val) => {
                                          const foundOption = options.find(
                                            (opt) => opt.value === val
                                          );

                                          if (!foundOption) {
                                            const displayValue =
                                              formik.values[
                                                columnDef.accessorKey
                                              ];
                                            if (displayValue) {
                                              if (columnDef.isMulti) {
                                                const displayValues =
                                                  displayValue.split(", ");
                                                const valueIndex =
                                                  selectedValues.indexOf(val);
                                                if (
                                                  valueIndex >= 0 &&
                                                  valueIndex <
                                                    displayValues.length
                                                ) {
                                                  return {
                                                    label:
                                                      displayValues[valueIndex],
                                                    value: val,
                                                  };
                                                }
                                              } else {
                                                return {
                                                  label: displayValue,
                                                  value: val,
                                                };
                                              }
                                            }
                                            return { label: val, value: val };
                                          }
                                          return foundOption;
                                        })
                                      : selectedValues
                                        ? [
                                            options.find(
                                              (opt) =>
                                                opt.value === selectedValues
                                            ) || {
                                              label:
                                                formik.values[
                                                  columnDef.accessorKey
                                                ] || selectedValues,
                                              value: selectedValues,
                                            },
                                          ]
                                        : [];

                                    const mergedOptions = [
                                      ...selectedOptions.filter(
                                        (sel) =>
                                          !options.some(
                                            (opt) => opt.value === sel.value
                                          )
                                      ),
                                      ...options,
                                    ];

                                    return (
                                      <div
                                        className="pt-4"
                                        key={columnDef.accessorKey}
                                      >
                                        <Select
                                          classNamePrefix="custom-select"
                                          styles={customStyles(theme)}
                                          className={`font-size13 ${
                                            formik.touched[
                                              columnDef.accessorKey
                                            ] &&
                                            formik.errors[columnDef.accessorKey]
                                              ? "is-invalid"
                                              : ""
                                          }`}
                                          isMulti={columnDef.isMulti || false}
                                          isSearchable
                                          name={columnDef.accessorKey}
                                          options={mergedOptions}
                                          value={
                                            columnDef.isMulti
                                              ? selectedOptions
                                              : selectedOptions[0]
                                          }
                                          onMenuScrollToBottom={() => {
                                            if (
                                              hasNextPage &&
                                              !isFetchingNextPage
                                            )
                                              fetchNextPage();
                                          }}
                                          onInputChange={(inputValue) => {
                                            handleInputChange(
                                              inputValue,
                                              columnDef?.payloadKey
                                            );
                                            if (
                                              inputValue &&
                                              !options.some((opt) =>
                                                opt.label
                                                  .toLowerCase()
                                                  .includes(
                                                    inputValue.toLowerCase()
                                                  )
                                              )
                                            ) {
                                            }
                                          }}
                                          onChange={(selectedOption) => {
                                            formik.setFieldValue(
                                              columnDef.payloadKey,
                                              columnDef.isMulti
                                                ? selectedOption.map(
                                                    (opt) => opt.value
                                                  )
                                                : selectedOption?.value
                                            );
                                            formik.setFieldValue(
                                              columnDef.accessorKey,
                                              columnDef.isMulti
                                                ? selectedOption
                                                    .map((opt) => opt.label)
                                                    .join(", ")
                                                : selectedOption?.label
                                            );
                                            if (
                                              columnDef.accessorKey ===
                                              "project_name"
                                            ) {
                                              setSelectedProjectId(
                                                selectedOption?.value
                                              );
                                              formik.setFieldValue(
                                                "sub_project_id",
                                                ""
                                              );
                                              formik.setFieldValue(
                                                "sub_project_name",
                                                ""
                                              );
                                            }
                                          }}
                                          onBlur={() =>
                                            formik.setFieldTouched(
                                              columnDef.payloadKey,
                                              true
                                            )
                                          }
                                          menuPlacement="auto"
                                          menuPosition="fixed"
                                          // getOptionLabel={(option) =>
                                          //   option.label || option.value
                                          // }
                                          getOptionValue={(option) =>
                                            option.value
                                          }
                                        />
                                        {formik.touched[columnDef.payloadKey] &&
                                        formik.errors[columnDef.payloadKey] ? (
                                          <div className="invalid-feedback ">
                                            {formik.errors[columnId]}
                                          </div>
                                        ) : (
                                          <div className="invisible">
                                            <span>invisible</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()
                                ) : (
                                  (() => {
                                    const options =
                                      columnDef.staticOptions || [];

                                    const selectedOptionId =
                                      formik.values[columnDef.payloadKey];
                                    const selectedOptionObj = options?.find(
                                      (opt) =>
                                        String(opt.value) ===
                                        String(selectedOptionId)
                                    );

                                    if (!options.length)
                                      return <span>Loading options...</span>;

                                    return (
                                      <div
                                        className="pt-4"
                                        key={columnDef.accessorKey}
                                      >
                                        {/* Static dropdown  */}
                                        <Select
                                          classNamePrefix="custom-select"
                                          styles={customStyles(theme)}
                                          className={`font-size13  ${
                                            formik.touched[
                                              columnDef.accessorKey
                                            ] &&
                                            formik.errors[
                                              columnDef.accessorKey
                                            ] &&
                                            "is-invalid"
                                          }`}
                                          isMulti={columnDef.isMulti || false}
                                          isSearchable
                                          name={columnDef.accessorKey}
                                          options={options}
                                          value={selectedOptionObj || null}
                                          onInputChange={handleInputChange}
                                          onChange={(selectedOption) => {
                                            formik.setFieldValue(
                                              columnDef.payloadKey,
                                              columnDef.isMulti
                                                ? selectedOption.map(
                                                    (opt) => opt.value
                                                  )
                                                : selectedOption?.value
                                            );
                                            formik.setFieldValue(
                                              columnDef.accessorKey,
                                              columnDef.isMulti
                                                ? selectedOption.map(
                                                    (opt) => opt.label
                                                  )
                                                : selectedOption?.label
                                            );
                                          }}
                                          onBlur={() =>
                                            formik.setFieldTouched(
                                              columnDef.accessorKey,
                                              true
                                            )
                                          }
                                          menuPlacement="auto"
                                          menuPosition="fixed"
                                        />
                                        {formik.touched[columnId] &&
                                        formik.errors[columnId] ? (
                                          <div className="invalid-feedback ">
                                            {formik.errors[columnId]}
                                          </div>
                                        ) : (
                                          <div className="invisible">
                                            <span>invisible</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()
                                )
                              ) : columnDef?.type === "date" ? (
                                <div className=" pt-4">
                                  <DatePicker
                                    style={{
                                      width: `${columnDef?.width}px`,
                                    }}
                                    name={columnId}
                                    className={`form-control fc-date  ${
                                      formik.touched[columnId] &&
                                      formik.errors[columnId]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id={columnId}
                                    selected={
                                      formik.values[columnId]
                                        ? new Date(formik.values[columnId])
                                        : null
                                    }
                                    onBlur={formik.handleBlur}
                                    onChange={(date) => {
                                      formik.setFieldValue(
                                        columnId,
                                        date ? format(date, "MM/dd/yyyy") : ""
                                      );
                                    }}
                                    maxDate={
                                      new Date(
                                        new Date().setDate(
                                          new Date().getDate() - 1
                                        )
                                      )
                                    } // Disables today & future dates
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="Select date"
                                    showYearDropdown
                                    dropdownMode="select"
                                    isClearable
                                  />
                                  {formik.touched[columnId] &&
                                  formik.errors[columnId] ? (
                                    <div className="invalid-feedback ">
                                      {formik.errors[columnId]}
                                    </div>
                                  ) : (
                                    <div className="invisible">
                                      <span>invisible</span>
                                    </div>
                                    // ""
                                  )}
                                </div>
                              ) : columnDef?.type === "textarea" ? (
                                (getAction.data.this_project == clientR ||
                                  getAction.data.this_project ==
                                    anthemElevance) &&
                                formik.values.action === "Rejected" ? (
                                  <div className="pt-4">
                                    <textarea
                                      style={{ width: `${columnDef?.width}px` }}
                                      name={columnId}
                                      className={`form-control font-size13 custom-inputborder  ${
                                        formik.touched[columnId] &&
                                        formik.errors[columnId]
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="text"
                                      id={columnId}
                                      value={formik.values[columnId] || ""}
                                      onChange={(e) => {
                                        formik.handleChange(e);
                                        formik.setFieldTouched(
                                          columnId,
                                          true,
                                          false
                                        );
                                      }}
                                      onBlur={formik.handleBlur}
                                    />
                                    {formik.touched[columnId] &&
                                    formik.errors[columnId] ? (
                                      <div className="invalid-feedback">
                                        {formik.errors[columnId]}
                                      </div>
                                    ) : (
                                      <div className="invisible">
                                        <span>invisible</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  getAction.data.this_project !== clientR && (
                                    <div className="pt-4">
                                      <textarea
                                        style={{
                                          width: `${columnDef?.width}px`,
                                        }}
                                        name={columnId}
                                        className={` form-control font-size13 custom-inputborder ${
                                          formik.touched[columnId] &&
                                          formik.errors[columnId]
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                        type="text"
                                        id={columnId}
                                        value={formik.values[columnId] || ""}
                                        onChange={(e) => {
                                          formik.handleChange(e);
                                          formik.setFieldTouched(
                                            columnId,
                                            true,
                                            false
                                          );
                                        }}
                                        onBlur={formik.handleBlur}
                                      />
                                      {formik.touched[columnId] &&
                                      formik.errors[columnId] ? (
                                        <div className="invalid-feedback">
                                          {formik.errors[columnId]}
                                        </div>
                                      ) : (
                                        <div className="invisible">
                                          <span>invisible</span>
                                        </div>
                                      )}
                                    </div>
                                  )
                                )
                              ) : columnDef?.type === "number" ? (
                                <div className=" pt-4">
                                  <input
                                    style={{
                                      width: `${columnDef?.width}px`,
                                    }}
                                    name={columnId}
                                    className={`form-control font-size13 custom-inputborder   ${
                                      formik.touched[columnId] &&
                                      formik.errors[columnId]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id={columnId}
                                    type="text"
                                    onChange={(e) => {
                                      formik.handleChange(e);
                                      formik.setFieldTouched(
                                        columnId,
                                        true,
                                        false
                                      );
                                    }}
                                    onBlur={formik.handleBlur}
                                    value={
                                      formik.values[columnId] !== undefined
                                        ? formik.values[columnId] === 0
                                          ? 0
                                          : formik.values[columnId]
                                        : ""
                                    }
                                  />
                                  {formik.touched[columnId] &&
                                  formik.errors[columnId] ? (
                                    <div className="invalid-feedback ">
                                      {formik.errors[columnId]}
                                    </div>
                                  ) : (
                                    <div className="invisible">
                                      <span>invisible</span>
                                    </div>
                                    // ""
                                  )}
                                </div>
                              ) : (
                                <div className=" pt-4">
                                  <input
                                    style={{
                                      width: `${columnDef?.width}px`,
                                    }}
                                    name={columnId}
                                    className={`form-control font-size13 custom-inputborder ${
                                      formik.touched[columnId] &&
                                      formik.errors[columnId]
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id={columnId}
                                    type="text"
                                    onChange={(e) => {
                                      formik.handleChange(e);
                                      formik.setFieldTouched(
                                        columnId,
                                        true,
                                        false
                                      );
                                    }}
                                    onBlur={formik.handleBlur}
                                    value={formik.values[columnId] || ""}
                                  />
                                  {formik.touched[columnId] &&
                                  formik.errors[columnId] ? (
                                    <div className="invalid-feedback">
                                      {formik.errors[columnId]}
                                    </div>
                                  ) : (
                                    <div className="invisible">
                                      <span>invisible</span>
                                    </div>
                                    // ""
                                  )}
                                </div>
                              )
                            ) : (cell.getValue() == null ||
                                cell.getValue() === "") &&
                              columnId !== "expand" &&
                              columnId !== "subprojects_count" &&
                              columnId !== "login_name" &&
                              columnId !== "actions" &&
                              columnId !== "created_by" ? (
                              "NA"
                            ) : (cell.getValue() == null ||
                                cell.getValue() === "") &&
                              columnId !== "expand" &&
                              columnId !== "subprojects_count" &&
                              columnId !== "login_name" &&
                              columnId !== "actions" &&
                              columnId !== "created_by" ? (
                              "NA"
                            ) : (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            )}
                            {columnId === "expand" && (
                              <>
                                {row?.original?.activity_logs?.length > 0 ? (
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip className="text-cap pointer">
                                        Logs
                                      </Tooltip>
                                    }
                                    container={this}
                                    placement="bottom"
                                  >
                                    <button
                                      onClick={() => row.toggleExpanded()}
                                      className="border-none"
                                    >
                                      {row.getIsExpanded() ? (
                                        <FaCaretUp className="text-secondary" />
                                      ) : (
                                        <FaCaretDown className="text-secondary" />
                                      )}
                                    </button>
                                  </OverlayTrigger>
                                ) : (
                                  ""
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {/* Expanded row content */}
                    {row.getIsExpanded() && (
                      <>
                        {row.original.activity_logs.map((log, index) => (
                          <tr key={index}>
                            <td className="sub-row">
                              <div
                                className={`subrow-vertical-stack ${
                                  index === 0 ? "" : "display-none"
                                }`}
                              >
                                <div className="subrow-line"></div>
                                <div className="subrow-head mx-auto">
                                  <span
                                    className={`subrow-btn mx-auto ${
                                      index === 0 ? "" : " active"
                                    }`}
                                  ></span>
                                </div>
                                <div className="subrow-line"></div>
                              </div>
                            </td>
                            {columns.map((col) => {
                              const columnId = col.accessorKey;
                              const properties = log.properties;

                              if (
                                !properties ||
                                !properties.old ||
                                !properties.attributes
                              ) {
                                return <td key={columnId}>NA</td>;
                              }

                              const oldValue = properties.old[columnId] ?? "";
                              const newValue =
                                properties.attributes[columnId] ?? "";
                              const updatedAt =
                                properties.attributes["updated_at"] ?? "";
                              const updatedBy =
                                properties.attributes["updated_by_name"] ?? "";
                              const hasChanges = oldValue !== newValue;

                              return (
                                <td key={columnId} className="sub-row">
                                  {hasChanges ? (
                                    <div className="flex">
                                      <span className="">
                                        {columnId === "created_at"
                                          ? formatDate(updatedAt)
                                          : oldValue}
                                      </span>
                                      <FaArrowRightLong className="mx-2 my-auto text-teal-600" />
                                      <span>
                                        {columnId === "created_at"
                                          ? formatDate(updatedAt)
                                          : newValue}
                                      </span>
                                      <span>
                                        {columnId === "created_by"
                                          ? updatedBy
                                          : ""}
                                      </span>
                                    </div>
                                  ) : (
                                    <div>
                                      {columnId === "created_at"
                                        ? formatDate(updatedAt)
                                        : columnId === "created_by"
                                          ? updatedBy
                                          : newValue}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          className={`d-flex page justify-content-between align-items-center m-t-15 pagination px-3 ${
            from ? "gap-0 px-0 sticky bottom-0 " : "gap-2 pe-2"
          }  `}
        >
          <div>
            {totalCount >= 10 && (
              <div className="d-flex align-items-center gap-2">
                {queryKey !== "searchResults" && (
                  <div className="d-flex align-items-center gap-2 position-relative bg-img">
                    <label htmlFor="perPage" className="per-page-label">
                      Per Page
                    </label>
                    <div>
                      <Select
                        options={options}
                        value={options.find((o) => o.value === perPage)}
                        onChange={handlePerPageChange}
                        styles={customSelectStyles(theme)}
                        menuPlacement="auto"
                        menuPosition="absolute"
                        isClearable={false}
                      />
                    </div>
                  </div>
                )}
                {totalCount > perPage && (
                  <div className="d-flex align-items-center gap-2 pagination-container ">
                    {goToPage > totalPage ? (
                      <div className="custom-tooltip">
                        Maximum limit is {totalPage}
                      </div>
                    ) : (
                      <></>
                    )}
                    <input
                      type="text"
                      id="goToPage"
                      className="border-hover goto-page bg-transparent text-theme text-center custom-inputborder "
                      m
                      in={1}
                      value={goToPage}
                      onChange={handleGoToPageChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleGoToPageSubmit();
                        }
                      }}
                      max={totalPage}
                      autoComplete="off"
                    />
                    <label
                      htmlFor="goToPage"
                      className="per-page-label text-light goto-bg d-flex align-items-center gap-1 m-l-6 "
                      onClick={handleGoToPageSubmit}
                    >
                      Go
                      <span>
                        <FaAngleRight />
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
          {queryKey !== "searchResults" && (
            <div>
              {totalCount ? (
                <>
                  <p className="per-page-label px-2">
                    Showing
                    <span className="wh-20 text-center d-inline-block">
                      {data?.pagination?.to}
                    </span>
                    out of
                    <span className="wh-20 text-center d-inline-block m-l-3 me-2">
                      {totalCount}
                    </span>
                    entries
                  </p>
                </>
              ) : (
                <p className="per-page-label px-2">No entries</p>
              )}
            </div>
          )}

          {totalCount > perPage ? (
            <ReactPaginate
              previousLabel={<FaAngleLeft className="text-theme" />}
              nextLabel={<FaAngleRight className="text-theme" />}
              pageCount={totalPage}
              onPageChange={handlePageClick}
              containerClassName={from ? "pagination" : "pagination"}
              pageClassName="page-item"
              pageLinkClassName="page-link text-theme"
              activeClassName="active bg-blue-400"
              disabledClassName={`${from ? "" : "disabled opacity-50"}  `}
              activeLinkClassName="bg-blue-400 text-theme rounded"
              forcePage={page - 1}
            />
          ) : (
            <div className="invisible py-3">invisible</div>
          )}
        </div>
      </div>
      {queryKey !== "getUsers-all-all" &&
      queryKey !== `getUsers-${roleFromQuery}-all` &&
      queryKey !== `getUsers-${roleFromQuery}-${locationFromQuery}` ? (
        <ModalComp
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          apiEndPoint={apiEndPoint}
          queryKey={queryKey}
          deleteRow={deleteRow}
        >
          <p className="logout-para text-theme  mt-3">
            Are you sure want to delete?
          </p>
        </ModalComp>
      ) : (
        <ModalComp
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          showActions={false}
        >
          <PostPayloadDelete
            closeAllModals={() => {
              setPostPayloadDeleteOpen(false);
              setShowDeleteModal(false);
            }}
            apiEndPoint={`users/${deleteRow?.id}`}
            payloadKey={"reason"}
            queryKey={"getUsers"}
            type={"dropdown"}
          />
        </ModalComp>
      )}

      {queryKey === "searchResults" && (
        <ModalComp
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          showActions={false}
        >
          <PostPayloadDelete
            closeAllModals={() => {
              setPostPayloadDeleteOpen(false);
              setShowDeleteModal(false);
            }}
            postEndPoint={
              IdendifyChart_id === "chart_id"
                ? `coder-chart/disable`
                : `auditor-chart/disable`
            }
            payloadKey={"comments"}
            queryKey="searchResults"
            chart_id={chartID}
            chart_uid={chartUID}
            team_id={team_id}
            clearFormikValues={clearFormikValues}
          />
        </ModalComp>
      )}
    </>
  );
};

export default ReactTable;
