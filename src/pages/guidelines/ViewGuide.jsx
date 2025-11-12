import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import { useAuth } from "../../../src/context/AuthContext";
import ModalComp from "../../components/ModalComp";
import PostPayloadDelete from "./PostPayloadDelete";
import { Link } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlinePending } from "react-icons/md";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { Loader } from "../../shared/Loader";

const ViewGuide = () => {
  const location = useLocation();
  const auth = useAuth();
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approveModalopen, setApproveModalOpen] = useState(false);
  const [PostPayloadDeleteopen, setPostPayloadDeleteOpen] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const rejectedStatus = false;
  const selectedGuide = location?.state.row;
  const selectedFileType = selectedGuide?.file_type;
  const [statusFlag, setStatusFlag] = useState(selectedGuide?.flag); // 0: pending, 1: approved, 2: rejected

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        if (!auth) {
          throw new Error("Authentication token not found");
        }

        const response = await axios.get(location.state.pdfurl, {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        // const pdfBlob = new Blob([response.data], { type: "application/pdf" ,"image/jpeg","image/png"});
        const contentType = response.headers["content-type"];
        const blob = new Blob([response.data], { type: contentType });

        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError("No PDF found in this view");
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [location.state.pdfurl, auth?.token]);

  if (loading)
    return (
      <div className="guide-loader">
        <Loader />
      </div>
    );

  const approveModal = () => {
    setApproveModalOpen(true);
  };

  const rejectModal = () => {
    setPostPayloadDeleteOpen(true);
  };

  const excelDownload = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}guidelines/download-file/${selectedGuide.id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      const contentType = response.headers["content-type"];
      const downloadUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "guidelines.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column mt-3">
        <div className="d-flex justify-content-between align-items-center  flex-wrap ">
          <div className="mb-2">
            <p className="t-title ">
              Project Name: {selectedGuide.project_name}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div>
              {(auth?.user?.role === "super_admin" ||
                auth?.user?.role === "manager" ||
                auth?.user?.role === "sme") &&
                statusFlag === 0 && (
                  <div className="non-cursor status-pending font-size13 py-1 px-4 d-flex align-items-center mx-2 cursor-none">
                    <MdOutlinePending className="guide-icon-pending" />
                    Pending
                  </div>
                )}
            </div>
            <Link className="text-decoration-none" to={`/guidelines`}>
              <OverlayTrigger
                overlay={<Tooltip className="text-cap">Back</Tooltip>}
                container={this}
                placement="bottom"
              >
                <button className="btn btn-primary custom-primary-btn back-btn font-size13 ">
                  <IoMdArrowRoundBack className="fs-5" />
                </button>
              </OverlayTrigger>
            </Link>
          </div>
        </div>

        <div className=" pt-3">
          {error ? (
            <div className="card d-flex justify-content-start align-items-start h-100 py-2 darkcard">
              <p className="guide-title">
                <div className="mb-2 mx-3">
                  <h5 className="">Title: {selectedGuide.title}</h5>
                  <h5 className="">Description: {selectedGuide.description}</h5>
                </div>
              </p>
            </div>
          ) : (
            <>
              <div className="card darkcard d-flex justify-content-start align-items-start py-2 h-100 mb-2">
                <p className="guide-title">
                  <div className="mb-2 mx-3">
                    <h5>Title: {selectedGuide.title}</h5>
                    <h5>Description: {selectedGuide.description}</h5>
                  </div>
                </p>
              </div>
              <div className="w-100 mx-auto view-hight ">
                {selectedFileType === ".xlsx" ||
                selectedFileType === ".xls" ||
                selectedFileType === ".csv" ? (
                  <div className="center-download-icon flex-column ">
                    <div className="download-card" onClick={excelDownload}>
                      <FaDownload className="download-icon-style" />
                      <div className="download-label mt-3">
                        Click here to download Excel
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="90%"
                    style={{ border: "none" }}
                    title="PDF Viewer"
                  />
                )}
              </div>
            </>
          )}
        </div>

        <div className="d-flex align-items-center mt-1">
          {(auth?.user?.role === "super_admin" ||
            auth?.user?.role === "manager") &&
            !actionCompleted &&
            statusFlag === 0 && (
              <>
                <button
                  className="btn btn-primary custom-primary-btn font-size13 py-2 px-4 d-flex align-items-center mx-2"
                  onClick={approveModal}
                >
                  Approve
                </button>
                <button
                  className="error-disagree font-size13 py-2 px-4 d-flex align-items-center"
                  onClick={rejectModal}
                >
                  Reject
                </button>
              </>
            )}
        </div>

        <ModalComp
          isOpen={approveModalopen}
          onClose={() => setApproveModalOpen(false)}
          confirmLabel="Approve"
          cancelLabel="Cancel"
          postEndPoint={`guidelines/approve/${selectedGuide.id}`}
          deleteRow={location.state.row}
          rejectedStatus={rejectedStatus}
          onSuccessAction={() => {
            setActionCompleted(true);
            setStatusFlag(1);
          }}
        >
          <p className="logout-para mt-3">Are you sure want to approve?</p>
        </ModalComp>

        <ModalComp
          isOpen={PostPayloadDeleteopen}
          onClose={() => setPostPayloadDeleteOpen(false)}
          showActions={false}
          onSuccessAction={() => {
            setActionCompleted(true);
            setStatusFlag(2);
          }}
        >
          <PostPayloadDelete
            closeAllModals={setPostPayloadDeleteOpen}
            postEndPoint={`guidelines/reject/${selectedGuide.id}`}
            payloadKey={"rejection_reason"}
            queryKey={"getGuidelines"}
            onSuccessAction={() => {
              setActionCompleted(true);
              setStatusFlag(2);
            }}
          />
        </ModalComp>
      </div>
    </div>
  );
};

export default ViewGuide;
