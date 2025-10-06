import * as React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as ViewIcon } from "../../media/ViewIcon.svg";
import { ReactComponent as Clipboard } from "../../media/clipboard_grey.svg";
// import { ReactComponent as LineGraph } from "../../media/linegraph.svg";

type Props = {
    courseId: number | string;
    code: string;
    selected: "prep" | "analytics" | "student" ;
};

/**
 * TASidebar Component - Displays a component on the left side of the screen
 * to allow TAs to navigate between pages: 
 * - Preparation: with Student Query Trends & Resources 
 * - Analytics: with Metrics & Student Reviews
 * - Student View: what the students can see
 * 
 * @component
 * @param Props - Contains: 
 * - `courseId`: the id for the course the TA is enrolled in ex. CS 3110
 * - `code`: the course code ex. 3110
 * - `selected`: which page the TA has currently selected
 * @returns 
 */
const TASidebar = ({ courseId, code, selected }: Props) => {
    const css = (condition: boolean) => (condition ? "selected" : "");

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
        </>
    );
};

export default TASidebar;
