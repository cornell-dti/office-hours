import * as React from "react";
import TAResourcesFile from "./TAResourceFile";

const dummyFiles = [
    {
        filename: "Homework 1_AA", 
        filetype: "pdf"
    },
    {
        filename: "Release_Code 1_AA",
        filetype: "py"
    }, 
    {
        filename: "Lecture7.1_AA",
        filetype: "pptx"
    },
    {
        filename: "Screenshot",
        filetype: "img"
    }
];
/* adjust for filetypes other than img? */

const TAResources = () => {

    return (
        <div className="ta-resources-container">
            <p className="ta-resources-header">Resources</p>
            <div className="files">
                {dummyFiles.map((file) => 
                    <TAResourcesFile
                        filename={file.filename}
                        filetype={file.filetype}
                    />
                )}
            </div>
        </div>
    );
};

export default TAResources;