import React, { useState } from "react";

type PageInfo = {
    header: string;
    leftButton: string;
    rightButton: string;
}

const CSVUploadView = (
    { onCancel } : 
    { onCancel: () => void }
) => {
    const [pageIndex, setPageIndex] = useState(0);
    const next = () => {
        setPageIndex(pageIndex + 1);
    }
    const previous = () => {
        if (pageIndex === 0) {
            onCancel()
        } else {
            setPageIndex(pageIndex - 1);
        }
    }


    const pageInfos: PageInfo[] = [
        { 
            header: "Step 1: Select a Format", 
            leftButton: "Cancel",
            rightButton: "Next"
        },
        {
            header: "Step 2: Upload a CSV file",
            leftButton: "Previous",
            rightButton: "Next"
        },
        {
            header: "Step 3: View and Confirm",
            leftButton: "Cancel and Re-upload",
            rightButton: "Finish"
        }
    ] 
    return (
        <div>
            <div>
                <div>
                    <div>
                        {pageInfos[pageIndex].header}
                    </div>
                </div>
            </div>
            <div>
                <button onClick={previous}>{pageInfos[pageIndex].leftButton}</button>
                <button onClick={next}>{pageInfos[pageIndex].rightButton}</button>
            </div>
        </div>
    )
}

export default CSVUploadView;