import { changeTabTitle } from "../../utils/changeTabTitle";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { useLocation, useNavigate, useParams } from "react-router";
import AuditorTabColumns from "./tableColumns/AuditorTabColumns";
import CoderTabColumns from "./tableColumns/CoderTabColumns";
import { Link } from "react-router";
import { useState } from "react";
import ProductionTable from "./teamSummary/table/ProductionTable";
import { IoMdArrowRoundBack } from "react-icons/io";

const ProductionUsers = () => {
  // all productions
  changeTabTitle("Team Production");
  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams();
  const selectedRow = location.state?.rows ?? id;
  const setUserId = null;
  const pathTab = location.pathname.includes("coders")
    ? "teams_coder"
    : "teams_auditor";
  const [activeTab, setActiveTab] = useState(pathTab);
  const [this_project, setThis_project] = useState(null);
  const teamSummary =
    activeTab === "teams_coder"
      ? `/production/coders/charts/${selectedRow}`
      : `/production/auditors/charts/${selectedRow}`;

  const handleTabSelect = (selectedKey) => {
    setActiveTab(selectedKey);
    const newPath =
      selectedKey === "teams_coder"
        ? `/production/coders/${selectedRow}`
        : `/production/auditors/${selectedRow}`;
    navigate(newPath, { state: { rows: selectedRow } });
  };
  const [cusotomheader, setCoustomheader] = useState("");

  return (
    <div className="container-fluid">
      <div className=" d-flex justify-content-between align-items-center mt-3 mx-3">
        <h5 className="t-title">Team Production</h5>
        <div className="d-flex align-items-center gap-3">
          <Link className="text-decoration-none" to={teamSummary}>
            <button className="btn btn-primary custom-primary-btn font-size13 px-3 ">
              Team summary
            </button>
          </Link>

          <Link className="text-decoration-none" to={`/teams`}>
            <button
              className="btn btn-primary custom-primary-btn back-btn font-size13"
              onClick={() => navigate(`/teams`)}
            >
              <IoMdArrowRoundBack className="fs-5" />
            </button>
          </Link>
        </div>
      </div>
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabSelect}
        id="production-tab"
        className="mt-3 darkcard py-0 px-3 bg-white w-auto border-none mb-2 rounded-3"
      >
        <Tab eventKey="teams_coder" title="Coders">
          {/* {activeTab === "teams_coder" && ( */}
          <ProductionTable
            activeTab="teams_coder"
            apiEndPoint={`team-users/${selectedRow}?role=coder`}
            exportApiEndPoint={`coders/export?team_id=${selectedRow}`}
            hourlyCoderExportApi={`coders/export-coder-chart-hourly?team_id=${selectedRow}`}
            onUserIdChange={setUserId}
            queryKey={"getCoderTab"}
            TeamProductionCoder={"TeamProductionCoder"}
            coderName={"coderName"}
            title="Coders"
            tableColumns={CoderTabColumns}
            module="production"
            setCoustomheader={setCoustomheader}
            customLeadName={cusotomheader}
            setThis_project={setThis_project}
            // tableHeight="600"
          />
          {/* )} */}
        </Tab>
        <Tab eventKey="teams_auditor" title="Auditors">
          {/* {activeTab === "teams_auditor" && ( */}
          <ProductionTable
            activeTab="teams_auditor"
            apiEndPoint={`team-users/${selectedRow}?role=auditor`}
            exportApiEndPoint={`auditors/export?team_id=${selectedRow}`}
            hourlyAuditorExportApi={`auditors/export-auditor-chart-hourly?team_id=${selectedRow}`}
            onUserIdChange={setUserId}
            TeamProductionAuditor={"TeamProductionAuditor"}
            queryKey={"getAuditorTab"}
            title="Auditors"
            auditorName={"auditorName"}
            tableColumns={AuditorTabColumns}
            module="production"
            customLeadName={cusotomheader}
            setThis_project={setThis_project}
            // tableHeight="600"
          />
          {/* )} */}
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProductionUsers;
