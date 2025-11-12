import React from "react";

const highlighter = ({ text = "", searchVal = "" }) => {
  // text = text.trim() ?? "";
  // searchVal = searchVal.trim() ?? "";
  // text = text.toString();
  text = text?.toString().trim() ?? "";
  searchVal = searchVal?.toString().trim() ?? "";

  searchVal = searchVal.toString();
  if (text.trim() !== "" && searchVal.trim() !== "") {
    const escapedHighlight = searchVal.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedHighlight})`, "gi"));

    return parts.map((part, index) =>
      part.toLowerCase() === searchVal.toLowerCase() ? (
        <span className="bg-high-ligher" key={`${index}-searchkey`}>
          {part}
        </span>
      ) : (
        part
      )
    );
  } else {
    return text;
  }
};
export default highlighter;
