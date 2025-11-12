import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../../services/apiClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCircle } from "react-icons/fa";
import { FaUsers, FaUsersSlash } from "react-icons/fa6";
import { Link } from "react-router";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const ProjectCount = () => {
  const location = useLocation();
  const selectedRow = location.state?.rows;
  const [visibleProjects, setVisibleProjects] = useState({});
  const [leadData, setLeadData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Infinite query to fetch paginated project counts
  const {
    data,
    fetchNextPage,
    isError,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["getProjectCount", selectedRow],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get(
        `client-projects/${selectedRow}?page=${pageParam}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage) =>
      lastPage?.data?.next_page_url
        ? lastPage.data.current_page + 1
        : undefined,
    enabled: !!selectedRow,
    // staleTime: Infinity,
  });

  const fetchLeadProject = async (projectId) => {
    try {
      const response = await apiClient.get(
        `client-projects/teams/${projectId}`
      );
      const leadArray = response.data?.data?.data || [];
      setLeadData((prev) => ({ ...prev, [projectId]: leadArray }));
    } catch (error) {
      console.error("Error fetching lead project data:", error);
    }
  };
  const toggleProjectVisibility = (projectId) => {
    if (!leadData[projectId]) fetchLeadProject(projectId);
    setVisibleProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setVisibleProjects({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll handler for fetching next page
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    const container = containerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading projects</div>;

  const projectCount = data?.pages.flatMap((page) => page.data.data) || [];

  return (
    <div className="container-fluid overflow-y-auto">
      <div className=" d-flex justify-content-between align-items-center mt-2 mx-3 mb-2">
        <h5>Project Count</h5>
        <Link className="text-decoration-none" to={`/clients`}>
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
      <div
        className="row mx-2 gy-4 w-100"
        style={{
          overflowY: projectCount.length > 10 ? "scroll" : "visible",
        }}
      >
        {projectCount.map((project) => (
          <div
            key={project.id}
            ref={containerRef}
            className="col-12 col-sm-6 col-md-6 col-lg-4 "
          >
            <div className="project-list-content  position-relative">
              <div
                className="project-box p-3 darkcard border-bottom-2 rounded-bottom-0"
                style={{ cursor: "pointer" }}
                onClick={() => toggleProjectVisibility(project.id)}
              >
                <div className="d-flex justify-content-center">
                  <div className="text-center col-4">
                    <h2>{project.team_count || "NA"}</h2>
                    <div>Teams count</div>
                  </div>
                </div>
                <div className="d-flex justify-content-between pt-3 gap-1">
                  <div className="text-center">
                    <p>
                      <span className="">{project.project_code || "NA"}</span>
                    </p>
                    <p className="cardname-text">
                      <FaCircle className="mb-1 fontSize10 me-2 text-orange" />
                      Project Code
                    </p>
                  </div>
                  <div className="text-center">
                    <p>
                      <span className="">{project.project_name || "NA"}</span>
                    </p>
                    <p className="cardname-text">
                      <FaCircle className="mb-1 fontSize10 me-2 text-primary" />
                      Project Name
                    </p>
                  </div>
                  <div className="text-center ">
                    <p>
                      <span className="cus-count">
                        {project.sub_projects_count || "NA"}
                      </span>
                    </p>
                    <p className="cardname-text">
                      <FaCircle className="mb-1 fontSize10 me-2 text-success " />
                      Subproject
                    </p>
                  </div>
                </div>
              </div>
              {visibleProjects[project.id] && (
                <div className="project-box-list darkcard-project  rounded-top-0">
                  {leadData[project.id] && leadData[project.id].length > 0 ? (
                    leadData[project.id].map((lead, idx) => (
                      <div
                        key={idx}
                        className="project-lead-row align-items-center py-3 px-2 mb-2 d-flex"
                      >
                        <div className="lead-info flex-grow-1">
                          <div className="fw-semibold text-capitalize mb-1">
                            {lead.status === "Active" ? (
                              ""
                            ) : (
                              <FaUsersSlash className="text-danger mb-1 me-1" />
                            )}
                          </div>
                          {/* <div className="small text-muted"> */}
                          <div className="flex-fill manager-col">
                            <div className=" text-capitalize mb-1">
                              <FaUsers className="mb-1 me-1" />
                              <span className="text-main ">Manager :</span>
                              <span className="ms-1 ">
                                {lead.manager_name || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex-fill head-col">
                            <div className=" text-capitalize mb-1 ms-icon-align">
                              <span className="text-main ">Project Head :</span>
                              <span className="ms-1 ">
                                {lead.project_head_name || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex-fill lead-col">
                            <div className=" text-capitalize mb-1 ms-icon-align">
                              <span className="text-main ">Lead :</span>
                              <span className="ms-1">
                                {lead.lead_name || "N/A"}
                              </span>
                            </div>
                          </div>
                          {/* </div> */}
                        </div>

                        <div className="lead-count text-center px-3">
                          <div className="fw-bold fs-5 badge profilecard-blue  ">
                            {lead.coders_count || "N/A"}
                          </div>
                          <div className="small  text-secondary">Coders</div>
                        </div>

                        <div className="lead-count text-center px-3 ">
                          <div className="fw-bold fs-5 badge profilecard-yellow  ">
                            {lead.auditors_count || "N/A"}
                          </div>
                          <div className="small  text-secondary ">Auditors</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No Teams found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCount;
