import * as React from "react";
import { useState, useEffect } from "react";
import downloadIcon from "../../media/download.svg";
import defaultFileIcon from "../../media/default_file.svg";
import imgIcon from "../../media/image_file.svg";

type Props = {
    filename: string;
    filetype: string;
}

const TAResourcesFile = (props: Props) => {
    const [fileIcon, setFileIcon] = useState(defaultFileIcon);

    useEffect (() => {
        if (props.filetype === "img") {
            setFileIcon(imgIcon);
        } else setFileIcon(defaultFileIcon);
    }, [props.filetype] )

    return (
        <div className="file-button-container">
            <div className="icon-name">
                <img src={fileIcon} alt="file-icon" className="file-icon"/>
                <p className="filename">{props.filename}</p>
            </div>
            <img src={downloadIcon} alt="download-icon" className="download-icon" />
        </div>
    );
};

export default TAResourcesFile;