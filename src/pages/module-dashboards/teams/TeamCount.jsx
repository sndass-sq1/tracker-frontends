import React, { useEffect, useRef } from "react";
import apiClient from "../../../services/apiClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { FaUsers, FaUsersSlash } from "react-icons/fa6";
import { Link } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ucFirst } from "../../../utils/ucFirst";

const TeamCount = () => {
  const location = useLocation();
  const selectedRow = location.state?.rows;
  const scrollContainerRef = useRef(null);

  const getTeamCount = async ({ pageParam = 1 }) => {
    const response = await apiClient.get(
      `project-teams/${selectedRow}?page=${pageParam}`
    );
    return response.data;
  };

  const {
    data,
    isError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["getTeamCount", selectedRow],
    queryFn: getTeamCount,
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedRow,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching team count</div>;

  return (
    <div className="container-fluid overflow-y-auto">
      <div className=" d-flex justify-content-between align-items-center mt-2 mx-3 mb-2">
        <h5>Team Count </h5>
        <Link className="text-decoration-none" to={`/projects`}>
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
        ref={scrollContainerRef}
        style={{ maxHeight: "80vh" }}
        className="row mx-2  my-2 gy-4 w-100 overflow-y-scroll"
      >
        {data.pages.map((page) =>
          page.data.data.map((team, index) => (
            <div
              key={team.team_name + index}
              className="col-12 col-sm-6 col-md-6 col-lg-4"
            >
              <div className="project-list-content position-relative">
                <div className="project-box darkcard">
                  <div className="d-flex justify-content-between border-bottom pb-3">
                    <div>
                      <p>
                        <span className="text-main fw-bold mx-2">Team</span>
                        {team.team_name || "NA"}
                      </p>
                    </div>
                    <div className=" d-flex">
                      <p className=" d-flex justify-content-end ">
                        {team.status === "Active" ? (
                          <div className="active-status">
                            <FaUsers />
                          </div>
                        ) : (
                          <div className="inactive-status ">
                            <FaUsersSlash />
                          </div>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="d-flex text-center my-2 mx-2">
                      <div>
                        <span className="text-main fw-bold">Coders</span>
                      </div>
                      <span className="fs-6   mx-2">
                        {team.coders_count || "NA"}
                      </span>
                    </p>
                    <p className="d-flex text-center my-2 mx-2">
                      <div>
                        <span className="text-main fw-bold">Auditors</span>
                      </div>
                      <span className="fs-6  mx-2">
                        {team.auditors_count || "NA"}
                      </span>
                    </p>
                    <p className="my-2">
                      <span className="text-main fw-bold mx-2">
                        Project Head
                      </span>
                      {ucFirst(team.project_head_name || "NA")}
                    </p>
                    <p className="my-2">
                      <span className="text-main fw-bold mx-2">Manager</span>
                      {ucFirst(team.manager_name || "NA")}
                    </p>
                    <p className="">
                      <span className="text-main fw-bold mx-2">Lead</span>
                      {ucFirst(team.lead_name || "NA")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isFetchingNextPage && <div>Loading more...</div>}
      </div>
    </div>
  );
};

export default TeamCount;
