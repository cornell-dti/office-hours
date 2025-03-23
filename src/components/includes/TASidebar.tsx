import * as React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ReactComponent as ViewIcon } from "../../media/ViewIcon.svg";
import { ReactComponent as Clipboard } from "../../media/clipboard.svg";
// import { ReactComponent as LineGraph } from "../../media/linegraph.svg";
import ExportCSVModal from "./ExportCSV";

type Props = {
    courseId: number | string;
    code: string;
    selected: "prep" | "analytics" | "student" ;
};

const TASidebar = ({ courseId, code, selected }: Props) => {
    const css = (condition: boolean) => (condition ? "selected" : "");

    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="TASidebar">
                <div className="nav">
                    <div className="header">
                        <span>{code}</span>
                    </div>
                    <div className="actions">
                        <Link to={"/ta/course/" + courseId}>
                            <button type="button" className={css(selected === "prep")}>
                                <div className="iconContainer">
                                    <Clipboard/>
                                </div>
                            Preparation
                            </button>
                        </Link>
                        {/* <Link to={"/ta-analytics/course/" + courseId}>
                            <button type="button" className={css(selected === "analytics")}>
                                <div className="lineGraphIconContainer">
                                    <LineGraph/>
                                </div>                                
                                Analytics
                            </button>
                        </Link> */}
                        <Link to={"/ta-student-view/course/" + courseId}>
                            <button type="button" className={css(selected === "student")}>
                                <div className="iconContainer">
                                    <ViewIcon />
                                </div>
                            Student View
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <ExportCSVModal setShowModal={setShowModal} showModal={showModal} courseId={"" + courseId} />
        </>
    );
};

export default TASidebar;
