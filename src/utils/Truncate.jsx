// import { useState, useEffect } from "react";
// import { FaCaretDown, FaCaretUp } from "react-icons/fa";

// const Truncate = ({ text = "", maxLength, children }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [showReadMore, setShowReadMore] = useState(false);

//   const contentToDisplay = typeof children !== "undefined" ? children : text;
//   const truncatedText =
//     typeof contentToDisplay === "string" && contentToDisplay.length > maxLength
//       ? contentToDisplay.slice(0, maxLength) + "..."
//       : contentToDisplay;

//   useEffect(() => {
//     if (typeof contentToDisplay === "string") {
//       setShowReadMore(contentToDisplay.length > maxLength);
//     }
//   }, [contentToDisplay, maxLength]);

//   return (
//     <div className="w-100">
//       <p
//         className={`mb-0 d-inline ${isExpanded ? "" : "text-truncate"}`}
//         style={{
//           maxHeight: isExpanded ? "100px" : "1.5em",
//           whiteSpace: isExpanded ? "pre-wrap" : "nowrap",
//           overflow: "hidden",
//           display: "inline-flex",
//           alignItems: "center",
//           width: "100%",
//         }}
//       >
//         {isExpanded ? contentToDisplay : truncatedText}

//         {showReadMore && (
//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="btn btn-link p-0 ms-1 d-inline-flex align-items-center"
//             aria-label="Toggle text display"
//             style={{ fontSize: "0.9rem" }}
//           >
//             {isExpanded ? (
//               <FaCaretUp className="text-secondary" />
//             ) : (
//               <FaCaretDown className="text-secondary" />
//             )}
//           </button>
//         )}
//       </p>
//     </div>
//   );
// };

// export default Truncate;
import { useState, useEffect } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
const Truncate = ({ text = "", maxLength, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);

  const contentToDisplay = children ?? text;

  // If children is JSX (from Highlighter), we can’t slice string directly.
  const plainText =
    typeof contentToDisplay === "string" ? contentToDisplay : text; // fallback to original text for truncation length

  const truncatedText =
    plainText.length > maxLength
      ? plainText.slice(0, maxLength) + "..."
      : plainText;

  useEffect(() => {
    setShowReadMore(plainText.length > maxLength);
  }, [plainText, maxLength]);

  return (
    <div className="w-100">
      <p
        className={`mb-0 d-inline ${isExpanded ? "" : "text-truncate"}`}
        style={{
          maxHeight: isExpanded ? "100px" : "1.5em",
          whiteSpace: isExpanded ? "pre-wrap" : "nowrap",
          overflow: "hidden",
          display: "inline-flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {isExpanded ? contentToDisplay : truncatedText}

        {showReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-link p-0 ms-1 d-inline-flex align-items-center"
            aria-label="Toggle text display"
            style={{ fontSize: "0.9rem" }}
          >
            {isExpanded ? (
              <FaCaretUp className="text-secondary" />
            ) : (
              <FaCaretDown className="text-secondary" />
            )}
          </button>
        )}
      </p>
    </div>
  );
};
export default Truncate;
