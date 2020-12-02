import React, { useState } from "react";

type PageInfo = {
    header: string;
    leftButton: string;
    rightButton: string;
}

const CSVUploadView = (
    { onReturn }: 
    { onReturn: () => void }
) => {
    const [pageIndex, setPageIndex] = useState(0);

    const pageInfos: PageInfo[] = [
        { 
            header: "Step 1: Select a Format", 
            leftButton: "Cancel",
            rightButton: "Next"
        },
        {
            header: "Step 2: Upload a CSV File",
            leftButton: "Previous",
            rightButton: "Next"
        },
        {
            header: "Step 3: View and Confirm",
            leftButton: "Cancel and Re-upload",
            rightButton: "Finish"
        }
    ]

    const next = () => {
        if (pageIndex < pageInfos.length - 1) {
            setPageIndex(pageIndex + 1);
        } else {
            Promise.resolve()
                .then(() => {
                    onReturn();
                });
        }
    }
    const previous = () => {
        if (pageIndex === 0) {
            onReturn();
        } else {
            setPageIndex(pageIndex - 1);
        }
    }


    return (
        <div>
            <div className="CSVBox">
                <div className="HeadContainer">
                    <div>
                        {pageInfos[pageIndex].header}
                    </div>
                </div>
                <div className="StepBody"> <span> </span> </div>
            </div>
            <div className="StepControls">
                <button type="button" className="leftbutton" onClick={previous}>{pageInfos[pageIndex].leftButton}
                </button>
                <div className="dots">
                    <span className={pageIndex === 0 ? "ondot":"offdot"}> </span>
                    <span className={pageIndex === 1 ? "ondot":"offdot"}> </span>
                    <span className={pageIndex === 2 ? "ondot":"offdot"}> </span>
                </div>
                <button type="button" className="rightbutton" onClick={next}>{pageInfos[pageIndex].rightButton}</button>
            </div>
        </div>
    )
}

export default CSVUploadView;