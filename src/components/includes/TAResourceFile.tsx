import * as React from "react";
import { useState, useEffect } from "react";
import downloadIcon from "../../media/download.svg";
import defaultFileIcon from "../../media/default_file.svg";
import imgIcon from "../../media/image_file.svg";

type Props = {
    filename: string;
    filetype: string;
    url: string;
}

/* each individual file button */
const TAResourcesFile = (props: Props) => {
    const [fileIcon, setFileIcon] = useState(defaultFileIcon);

    useEffect (() => {
        if (props.filetype === "img") {
            setFileIcon(imgIcon);
        } else setFileIcon(defaultFileIcon);
    }, [props.filetype] )

    const handleFileClick = (e: React.MouseEvent) => {
        // Open file in new tab/window
        window.open(props.url, '_blank');
    };

    const handleDownloadClick = (e: React.MouseEvent) => {
        // Stop propagation to prevent triggering parent click
        e.stopPropagation();
        // Open file in new tab/window (same as general area)
        window.open(props.url, '_blank');
    };

    return (
        <div className="file-button-container" onClick={handleFileClick}>
            <div className="icon-name">
                <img src={fileIcon} alt="file-icon" className="file-icon"/>
                <p className="filename" title={props.filename}>{props.filename}</p>
            </div>
            <img 
                src={downloadIcon} 
                alt="download-icon" 
                className="download-icon"
                onClick={handleDownloadClick}
            />
        </div>
    );
};

export default TAResourcesFile;