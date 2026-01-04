import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { MetricData, MetricsResult, calcTAMetrics } from "../../firebasefunctions/taMetrics";
import ReusableBarGraph from "./ReusableBarGraph";

type TAMetricsProps = {
    user: FireUser;
}

/**
 * Renders and displays the three graph components for the TA Analytics Page. 
 * Calls Reusable Bar Graph to render the three individual metric graphs. 
 * Displays data for the bar graphs from Monday to Sunday for the current week, if the current
 * day is in the middle of the week, then the component displays data from Monday to the current day.
 * 
 * @param user - The user (ta) that we fetch the metrics for 
 */
const TAMetrics = ({ user } : TAMetricsProps) => {
    const [studentsHelped, setStudentsHelped] = useState<MetricData>();
    const [timeSpent, setTimeSpent] = useState<MetricData>();
    const [waitTime, setWaitTime] = useState<MetricData>();

    // Calculates the date of the most recent Monday that's passed, that way data can be displayed
    // from `monday` to `today` which are then the `startDate` and `endDate` parameters for `calcTAMetrics`
    const { monday, today } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = (dayOfWeek + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diff);

        return { monday, today };
    }, []);
  

    // Currently uses the returned output from `calcTAMetrics` instead of fetching from firebase.
    // Can consider to change this depending on efficiency?
    const fetchData = async () => {
        try {
            const data: MetricsResult = await calcTAMetrics(user.userId, monday, today);
            setStudentsHelped(data.studentsHelped);
            setTimeSpent(data.timeSpent);
            setWaitTime(data.waitTime);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error fetching data: ", error);
        }
    }
    useEffect(() => {
        fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.userId])

    return (
        <div className="ta-metrics-container">
            <div className="ta-metrics-header">
                <p className="header-text">Metrics</p>
            </div>
            <div className="graphs-container">
                {studentsHelped && timeSpent && waitTime ? (
                    <>
                        <ReusableBarGraph
                            barData={studentsHelped.barData}
                            title="Students Helped"
                            subtitle={
                                <>
                                    You helped a total of{" "}
                                    <span className="emphasis">{studentsHelped.weeklyAvg} students</span>{" "}
                                    this week
                                </>
                            }
                        />
                        <ReusableBarGraph
                            barData={timeSpent.barData}
                            title="Time Spent Per Student"
                            subtitle={
                                <>
                                    You spent an average of{" "}
                                    <span className="emphasis">
                                        {timeSpent.weeklyAvg} minutes
                                    </span>{" "}
                                    with each student this week
                                </>
                            }
                        />
                        <ReusableBarGraph
                            barData={waitTime.barData}
                            title="Wait Time Per Student"
                            subtitle={
                                <>
                                    Students waited for help for an average of{" "}
                                    <span className="emphasis">
                                        {waitTime.weeklyAvg} minutes
                                    </span>{" "}
                                    this week
                                </>
                            }
                        />
                    </>
                ) : (
                    <>
                    </>
                )}
            </div>
        </div>
    );
};

export default TAMetrics;