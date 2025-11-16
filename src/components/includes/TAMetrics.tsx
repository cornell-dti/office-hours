import * as React from "react";
import ReusableBarGraph from "./ReusableBarGraph";
import studentHelpedData from "../../studentHelped.json";
import timeSpentData from "../../timeSpent.json";
import waitTimeData from "../../waitTime.json";

const TAMetrics = () => {
    const studentHelpedTotal = studentHelpedData.barData.reduce((acc, curr) => acc + Number(curr.value), 0);
 
    const avgTime = ({ barData }: { barData: { dayOfWeek: string; value: string }[] }) => {
        const total = barData.reduce((acc, curr) => acc + Number(curr.value), 0);
        return Math.round(total / timeSpentData.barData.length);
    };

    return (
        <div className="ta-metrics-container">
            <div className="ta-metrics-header">
                <p className="header-text">Metrics</p>
            </div>
            <div className="graphs-container">
                <ReusableBarGraph
                    barData={studentHelpedData.barData}
                    title="Students Helped"
                    subtitle={
                        <>
                            You helped a total of{" "}
                            <span className="emphasis">{studentHelpedTotal} students</span>{" "}
                            this week
                        </>
                    }
                />
                <ReusableBarGraph
                    barData={timeSpentData.barData}
                    title="Time Spent Per Student"
                    subtitle={
                        <>
                            You spent an average of{" "}
                            <span className="emphasis">
                                {avgTime(timeSpentData)} minutes
                            </span>{" "}
                            with each student this week
                        </>
                    }
                />
                <ReusableBarGraph
                    barData={timeSpentData.barData}
                    title="Wait Time Per Student"
                    subtitle={
                        <>
                            Students waited for help for an average of{" "}
                            <span className="emphasis">
                                {avgTime(waitTimeData)} minutes
                            </span>{" "}
                            this week
                        </>
                    }
                />
            </div>
        </div>
    );
};

export default TAMetrics;