import * as React from "react";
import { useState, useEffect } from "react";
import { MetricData, MetricsResult, calcTAMetrics } from "../../firebasefunctions/taMetrics";
import ReusableBarGraph from "./ReusableBarGraph";

type TAMetricsProps = {
    user: FireUser;
}

const TAMetrics = ({ user } : TAMetricsProps) => {
    const [studentsHelped, setStudentsHelped] = useState<MetricData>();
    const [timeSpent, setTimeSpent] = useState<MetricData>();
    const [waitTime, setWaitTime] = useState<MetricData>();

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);

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
    }, [user.userId])

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