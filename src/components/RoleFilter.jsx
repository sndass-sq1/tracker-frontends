import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Spinner,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import { ucFirst } from "../utils/ucFirst";
import {
  FiChevronDown,
  FiChevronUp,
  FiSliders,
  FiMapPin,
  FiUser,
  FiFolder,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const RoleFilter = ({
  setFilteredRoleId,
  setFilteredLocationId,
  setFilteredManagerId,
  filteredManagerId,
  setFilteredProjectId,
  filteredProjectId,
  setFilteredAssignId,
  filteredAssignId,
  setFilteredLeadId,
  filteredLeadId,
  setFilteredProjectheadId,
  filteredProjectheadId,
  selectedLocationId: propLocationId,
  selectedRoleId: propRoleId,
  selectedManagerId: propManagerId,
  selectedProjectId: propProjectId,
  selectedAssignId: propAssignId,
  selectedLeadId: propLeadId,
  selectedProjectheadId: propProjectheadId,
  resetTrigger,
  queryKey,
}) => {
  const auth = useAuth();
  const loaderRef = useRef();
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const [listProject_id, setListProject_Id] = useState(null);
  const [listProjectid_assign, setListProjectid_Assign] = useState(null);
  const location = useLocation();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const [managerSearch, setManagerSearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [projectheadSearch, setProjectheadSearch] = useState("");

  // const isResetDisabled = !selectedType;

  const roleFromQuery = queryParams.get("role_id");
  const locationFromQuery = queryParams.get("location_id");
  const managerFromQuery = queryParams.get("manager_id");
  const projectFromQuery = queryParams.get("project_id");
  const AssignFromQuery = queryParams.get("project_id");
  const LeadFromQuery = queryParams.get("lead_id");
  const ProjectheadFromQuery = queryParams.get("projecthead_id");

  const [selectedLocationId, setSelectedLocationId] = useState(
    locationFromQuery ? parseInt(locationFromQuery) : propLocationId
  );
  const [selectedRoleId, setSelectedRoleId] = useState(
    roleFromQuery ? parseInt(roleFromQuery) : propRoleId
  );
  const [selectedmanagerId, setSelectedmanagerId] = useState(
    managerFromQuery ? parseInt(managerFromQuery) : propManagerId
  );
  const [selectedProjectId, setselectedProjectId] = useState(
    projectFromQuery ? parseInt(projectFromQuery) : propProjectId
  );
  const [selectedAssignId, setselectedAssignId] = useState(
    AssignFromQuery ? parseInt(AssignFromQuery) : propAssignId
  );
  const [selectedLeadId, setselectedLeadId] = useState(
    LeadFromQuery ? parseInt(LeadFromQuery) : propLeadId
  );
  const [selectedProjectheadId, setselectedProjectheadId] = useState(
    ProjectheadFromQuery ? parseInt(ProjectheadFromQuery) : propProjectheadId
  );

  // Fetch locations
  const { data: listLocation = [], isLoading: loadingLocations } = useQuery({
    queryKey: ["locationDropdown"],
    queryFn: async () => {
      const res = await apiClient.get("locations/dropdown");
      return Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
    },
    enabled: queryKey === "getUsers-all-all",
  });

  // Fetch roles
  const { data: listRole = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["roleDropdown"],
    queryFn: async () => {
      const res = await apiClient.get("roles");
      return Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
    },
    enabled: queryKey === "getUsers-all-all",
  });

  // Fetch managers
  const [managerId, setManagerId] = useState(null);
  // const { data: listManager = [] } = useQuery({
  //   queryKey: ["managerDropdown"],
  //   queryFn: async () => {
  //     const res = await apiClient.get("managers/dropdown");
  //     setManagerId(res.data?.data?.data[0]?.id || null);
  //     return Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
  //   },
  //   enabled:
  //     auth.user.role !== "lead" &&
  //     queryKey !== "getUsers-all-all" &&
  //     auth.user.role !== "sme" &&
  //     auth.user.role !== "project_head" &&
  //     auth.user.role !== "coder" &&
  //     auth.user.role !== "auditor",
  // });
  const {
    data: managerPages,
    fetchNextPage: fetchNextManagerPage,
    hasNextPage: hasNextManagerPage,
    isFetchingNextPage: isFetchingNextManagerPage,
  } = useInfiniteQuery({
    queryKey: ["managerDropdown", managerSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(
        `managers/dropdown?page=${pageParam}&search=${managerSearch}`
      );
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage.next_page_url;
      if (!nextUrl) return undefined;
      const match = nextUrl.match(/page=(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    },
    enabled:
      // selectedType === "manager" && show,
      auth.user.role !== "lead" &&
      queryKey !== "getUsers-all-all" &&
      auth.user.role !== "sme" &&
      auth.user.role !== "project_head" &&
      auth.user.role !== "coder" &&
      auth.user.role !== "auditor",
  });

  const listManager = managerPages?.pages.flatMap((page) => page.data) || [];

  //Fetch Lead
  const [leadId, setLeadId] = useState(null);
  // const { data: listLead = [] } = useQuery({
  //   queryKey: ["leadDropdown"],
  //   queryFn: async () => {
  //     const res = await apiClient.get("leads-all/dropdown");
  //     setLeadId(res.data?.data?.data[0]?.id || null);
  //     return Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
  //   },
  //   enabled:
  //     auth.user.role !== "lead" &&
  //     queryKey !== "getUsers-all-all" &&
  //     auth.user.role !== "sme" &&
  //     auth.user.role !== "coder" &&
  //     auth.user.role !== "auditor",
  // });

  const {
    data: leadPages,
    fetchNextPage: fetchNextLeadPage,
    hasNextPage: hasNextLeadPage,
    isFetchingNextPage: isFetchingNextLeadPage,
  } = useInfiniteQuery({
    queryKey: ["leadDropdown", leadSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(
        `leads-all/dropdown?page=${pageParam}&search=${leadSearch}`
      );
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage.next_page_url;
      if (!nextUrl) return undefined;
      const match = nextUrl.match(/page=(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    },
    // enabled: selectedType === "lead" && show,
    enabled:
      auth.user.role !== "lead" &&
      queryKey !== "getUsers-all-all" &&
      auth.user.role !== "sme" &&
      auth.user.role !== "coder" &&
      auth.user.role !== "auditor",
  });
  const listLead = leadPages?.pages.flatMap((page) => page.data) || [];

  //Fetch Project Head
  const [projectheadId, setProjectheadId] = useState(null);
  const {
    data: projectheadPages,
    fetchNextPage: fetchNextProjectheadPage,
    hasNextPage: hasNextProjectheadPage,
    isFetchingNextPage: isFetchingNextProjectheadPage,
  } = useInfiniteQuery({
    queryKey: ["projectheadDropdown", projectheadSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(
        `project-heads/dropdown?page=${pageParam}&search=${projectheadSearch}`
      );
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage.next_page_url;
      if (!nextUrl) return undefined;
      const match = nextUrl.match(/page=(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    },
    enabled:
      auth.user.role !== "lead" &&
      queryKey !== "getUsers-all-all" &&
      auth.user.role !== "sme" &&
      auth.user.role !== "coder" &&
      auth.user.role !== "auditor",
  });
  const listProjecthead =
    projectheadPages?.pages.flatMap((page) => page.data) || [];

  //Fetch projects id
  const { data: datas = [] } = useQuery({
    queryKey: ["getDatas"],
    queryFn: async () => {
      const res = await apiClient.get("projects/dropdown");
      res.data.data.data.map((item) => setListProject_Id(item.id));
      return Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
    },
    enabled:
      auth.user.role !== "lead" &&
      auth.user.role !== "coder" &&
      auth.user.role !== "auditor",
  });

  //Fetch Assigend projects
  const { data: listAssign = [] } = useQuery({
    queryKey: ["getAssign"],
    queryFn: async () => {
      const res = await apiClient.get("projects/assigned");
      res.data.data.data.map((item) => setListProjectid_Assign(item.id));
      return Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
    },
    enabled:
      queryKey !== "getUsers-all-all" &&
      queryKey !== "getGuidelines" &&
      auth.user.role !== "lead" &&
      auth.user.role !== "super_admin" &&
      queryKey !== "getTeams",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (
            selectedType === "manager" &&
            hasNextManagerPage &&
            !isFetchingNextManagerPage
          ) {
            fetchNextManagerPage();
          }
          if (
            selectedType === "lead" &&
            hasNextLeadPage &&
            !isFetchingNextLeadPage
          ) {
            fetchNextLeadPage();
          }
          if (
            selectedType === "projecthead" &&
            hasNextProjectheadPage &&
            !isFetchingNextProjectheadPage
          ) {
            fetchNextProjectheadPage();
          }
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [
    loaderRef.current,
    selectedType,
    hasNextManagerPage,
    hasNextLeadPage,
    isFetchingNextManagerPage,
    isFetchingNextLeadPage,
    hasNextProjectheadPage,
    isFetchingNextProjectheadPage,
  ]);

  useEffect(() => {
    setSelectedType(null);
    setSelectedValue(null);
    setSelectedmanagerId(null);
    setselectedLeadId(null);
    setselectedProjectheadId(null);
  }, [resetTrigger]);

  // checkbox toggle
  const handleTypeChange = (type) => {
    setSelectedType((prev) => (prev === type ? null : type)); // toggle
    setSelectedValue(null); // clear selection on role change
    setSelectedmanagerId(null);
    setselectedLeadId(null);
    setselectedProjectheadId(null);
  };

  let options = [];
  if (selectedType === "manager") {
    options = listManager.map((m) => ({
      value: `manager-${m.id}`,
      label: `${ucFirst(m.name)}`,
      type: "manager",
    }));
  } else if (selectedType === "lead") {
    options = listLead.map((l) => ({
      value: `lead-${l.id}`,
      label: `${ucFirst(l.name)}`,
      type: "lead",
    }));
  } else if (selectedType === "projecthead") {
    options = listProjecthead.map((ph) => ({
      value: `projecthead-${ph.id}`,
      label: `${ucFirst(ph.name)}`,
      type: "projecthead",
    }));
  }

  const applyFilters = () => {
    if (queryKey !== "getTeams") {
      if (typeof setFilteredLocationId === "function") {
        setFilteredLocationId(selectedLocationId);
      }

      if (typeof setFilteredRoleId === "function") {
        setFilteredRoleId(selectedRoleId);
      }
    }

    if (typeof setFilteredManagerId === "function") {
      setFilteredManagerId(selectedmanagerId);
    }
    if (typeof setManagerId === "function") {
      setManagerId(managerId);
    }

    if (typeof setFilteredProjectId === "function") {
      setFilteredProjectId(selectedProjectId);
    }

    if (typeof setFilteredAssignId === "function") {
      setFilteredAssignId(selectedAssignId);
    }

    if (typeof setFilteredLeadId === "function") {
      setFilteredLeadId(selectedLeadId);
    }
    if (typeof setLeadId === "function") {
      setLeadId(leadId);
    }

    if (typeof setFilteredProjectheadId === "function") {
      setFilteredProjectheadId(selectedProjectheadId);
    }
    if (typeof setProjectheadId === "function") {
      setProjectheadId(projectheadId);
    }

    handleClose();
  };

  useEffect(() => {
    if (!filteredManagerId) {
      setSelectedmanagerId(null);
    }
  }, [filteredManagerId]);

  useEffect(() => {
    if (!filteredProjectId) {
      setselectedProjectId(null);
    }
  }, [filteredProjectId]);

  useEffect(() => {
    if (!filteredAssignId) {
      setselectedAssignId(null);
    }
  }, [filteredAssignId]);

  useEffect(() => {
    if (!filteredLeadId) {
      setselectedLeadId(null);
    }
  }, [filteredLeadId]);

  useEffect(() => {
    if (!filteredProjectheadId) {
      setselectedProjectheadId(null);
    }
  }, [filteredProjectheadId]);

  const loading = loadingLocations || loadingRoles;
  useEffect(() => {
    setSelectedRoleId(propRoleId || null);
  }, [propRoleId]);
  useEffect(() => {
    setSelectedRoleId(propRoleId || null);
  }, [propRoleId]);

  useEffect(() => {
    setSelectedLocationId(propLocationId || null);
  }, [propLocationId]);

  return (
    <>
      <div
        onClick={handleShow}
        className="d-flex align-items-center dropdown-theme  rounded px-3 pointer"
        classNamePrefix="custom-select"
      >
        <p className="mb-0 font-size13">Filter by</p>

        {show ? (
          <FiChevronUp className="ms-2 text-secondary" />
        ) : (
          <FiChevronDown className="ms-2 text-secondary" />
        )}
      </div>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header
          style={{ backgroundColor: "#f8f9fe" }}
          className="darkcard"
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <FiSliders /> Advanced Filter
          </Modal.Title>

          <button
            type="button"
            className="btn-close ms-auto filtered-image"
            aria-label="Close"
            onClick={handleClose}
          ></button>
        </Modal.Header>

        <Modal.Body className="darkcard">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="d-flex border rounded p-3 gap-4">
              {queryKey !== "getTeams" &&
              queryKey !== "getGuidelines" &&
              queryKey !== "smefeedbackItems" ? (
                <>
                  {/* Location Column */}
                  <div className="flex-fill pe-3 border-end">
                    <div className="d-flex align-items-center gap-2 mb-3 border border-1 rounded rounded-2 py-1 px-2">
                      <FiMapPin className="text-warning fs-5" />
                      <span className="fw-semibold">By Location</span>
                    </div>
                    {listLocation.length > 0 ? (
                      listLocation.map((loc) => (
                        <Form.Check
                          key={loc.id}
                          type="radio"
                          name="locationGroup"
                          id={`location-${loc.id}`}
                          label={ucFirst(loc.district)}
                          checked={selectedLocationId === loc.id}
                          onChange={() => setSelectedLocationId(loc.id)}
                          className="mb-2 blue-radio"
                        />
                      ))
                    ) : (
                      <div>No locations found</div>
                    )}
                  </div>

                  {/* Role Column */}
                  <div className="flex-fill ps-3">
                    <div className="d-flex align-items-center gap-2 mb-3 border border-1 rounded rounded-2 py-1 px-2">
                      <FiUser className="text-primary fs-5" />
                      <span className="fw-semibold">By Role</span>
                    </div>
                    {listRole.length > 0 ? (
                      listRole.map((role) => (
                        <Form.Check
                          key={role.id}
                          type="radio"
                          name="roleGroup"
                          id={`role-${role.id}`}
                          label={ucFirst(role.role)}
                          checked={selectedRoleId === role.id}
                          onChange={() => setSelectedRoleId(role.id)}
                          className="mb-2 blue-radio"
                        />
                      ))
                    ) : (
                      <div>No roles found</div>
                    )}
                  </div>
                </>
              ) : queryKey !== "getGuidelines" &&
                queryKey !== "smefeedbackItems" ? (
                <>
                  <div className="flex-fill ps-3">
                    <div className="d-flex align-items-center  gap-2 mb-3 border border-1 rounded rounded-2 py-1 px-2">
                      <FiUser className="text-primary fs-5" />
                      <span className="fw-semibold">
                        By Manager / Lead / Projecthead
                      </span>
                    </div>
                    <div className="d-flex gap-3 mb-3 ms-2">
                      <label className="d-flex align-items-center gap-1  team-filter">
                        <input
                          type="checkbox"
                          checked={selectedType === "manager"}
                          onChange={() => handleTypeChange("manager")}
                        />
                        Manager
                      </label>
                      <label className="d-flex align-items-center gap-1  team-filter">
                        <input
                          type="checkbox"
                          checked={selectedType === "lead"}
                          onChange={() => handleTypeChange("lead")}
                        />
                        Lead
                      </label>
                      <label className="d-flex align-items-center gap-1  team-filter">
                        <input
                          type="checkbox"
                          checked={selectedType === "projecthead"}
                          onChange={() => handleTypeChange("projecthead")}
                        />
                        Projecthead
                      </label>
                    </div>

                    <Select
                      options={options}
                      classNamePrefix="custom-select"
                      value={selectedValue}
                      onChange={(option) => {
                        setSelectedValue(option);

                        if (option?.type === "manager") {
                          setSelectedmanagerId(
                            parseInt(option.value.split("-")[1])
                          );
                        } else if (option?.type === "lead") {
                          setselectedLeadId(
                            parseInt(option.value.split("-")[1])
                          );
                        } else if (option?.type === "projecthead") {
                          setselectedProjectheadId(
                            parseInt(option.value.split("-")[1])
                          );
                        }
                      }}
                      isClearable
                      placeholder={
                        selectedType
                          ? `Select ${ucFirst(selectedType)}...`
                          : "Please select a role"
                      }
                      isSearchable
                      isDisabled={!selectedType}
                      isMulti={false}
                      className="mb-2"
                      onInputChange={(inputValue) => {
                        if (selectedType === "manager")
                          setManagerSearch(inputValue);
                        if (selectedType === "lead") setLeadSearch(inputValue);
                        if (selectedType === "projecthead")
                          setProjectheadSearch(inputValue);
                      }}
                      onMenuScrollToBottom={() => {
                        if (
                          selectedType === "manager" &&
                          hasNextManagerPage &&
                          !isFetchingNextManagerPage
                        ) {
                          fetchNextManagerPage();
                        }
                        if (
                          selectedType === "lead" &&
                          hasNextLeadPage &&
                          !isFetchingNextLeadPage
                        ) {
                          fetchNextLeadPage();
                        }
                        if (
                          selectedType === "projecthead" &&
                          hasNextProjectheadPage &&
                          !isFetchingNextProjectheadPage
                        ) {
                          fetchNextProjectheadPage();
                        }
                      }}
                    />
                  </div>
                </>
              ) : queryKey !== "smefeedbackItems" ? (
                <>
                  <div className="flex-fill ps-3">
                    <div className="d-flex align-items-center gap-2 mb-3 border border-1 rounded rounded-2 py-1 px-2">
                      <FiFolder className="text-info fs-5" />
                      <span className="fw-semibold">By Projects</span>
                    </div>
                    {datas.length > 0 ? (
                      datas.map((role) => (
                        <Form.Check
                          key={role.id}
                          type="radio"
                          name="roleGroup"
                          id={`role-${role.id}`}
                          label={ucFirst(role.project_name)}
                          checked={selectedProjectId === role.id}
                          onChange={() => setselectedProjectId(role.id)}
                          className="mb-2 blue-radio"
                        />
                      ))
                    ) : (
                      <div>No projects found</div>
                    )}
                  </div>
                </>
              ) : (
                queryKey === "smefeedbackItems" && (
                  <>
                    <div className="flex-fill ps-3">
                      <div className="d-flex align-items-center gap-2 mb-3 border border-1 rounded rounded-2 py-1 px-2">
                        <FiFolder className="text-info fs-5" />
                        <span className="fw-semibold">By Projects </span>
                      </div>
                      {listAssign.length > 0 ? (
                        listAssign.map((role) => (
                          <Form.Check
                            key={role.id}
                            type="radio"
                            name="roleGroup"
                            id={`role-${role.id}`}
                            label={ucFirst(role.project_name)}
                            checked={selectedAssignId === role.id}
                            onChange={() => setselectedAssignId(role.id)}
                            className="mb-2 blue-radio"
                          />
                        ))
                      ) : (
                        <div>No projects found</div>
                      )}
                    </div>
                  </>
                )
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="darkcard">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={applyFilters}
            style={{
              backgroundColor: "#33B1FF",
              border: "none",
              padding: "10px 18px",
              borderRadius: "6px",
            }}
          >
            Apply Filter
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RoleFilter;
