import * as React from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";
import { Icon } from "semantic-ui-react";

type Props = {
    barData: BarDatum[];
    timeKeys: string[];
    yMax: number;
    legend: string;
    OHDetails: {
        [id: string]: {
            ta: string;
            location: string;
            startHour: string;
            endHour: string;
            avgWaitTime: string;
        };
    };
};

const WaitTimeGraph = (props: Props) => {
    const today = new Date();
    const day = today.getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[day];
    const [selectedDay, setSelectedDay] = React.useState<string>(dayOfWeek);

    const currentHour = today.getHours();

    console.log("Current hour:", currentHour);

    // Transform data to have hours on x-axis and one series for selected day
    const transformData = () => {
        const hours = props.timeKeys;
        const dayData = props.barData.find((d) => d.dayOfWeek === selectedDay);

        if (!dayData) return [];

        return hours.map((hour) => ({
            hour,
            waitTime: dayData[hour],
        }));
    };

    return (
        <div style={{ height: 300 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "20px",
                    gap: "10px",
                }}
            >
                {dayNames.map((dayName) => (
                    <button
                        key={dayName}
                        onClick={() => setSelectedDay(dayName)}
                        style={{
                            backgroundColor: selectedDay === dayName ? "#4285f4" : "#f1f3f4",
                            color: selectedDay === dayName ? "white" : "black",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        {dayName === dayOfWeek ? "Today" : dayName}
                    </button>
                ))}
            </div>

            <ResponsiveBar
                data={transformData()}
                keys={["waitTime"]}
                indexBy="hour"
                borderWidth={1}
                colors={(bar) => (bar.indexValue === today ? "#4285F4" : "#D2E3FC")}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 60,
                }}
                borderRadius={4}
                padding={0.05}
                enableLabel={false}
                tooltip={({ value, data }) => (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "10px",
                            paddingRight: "25px",
                            border: "2px solid black",
                            borderRadius: "4px",
                            textAlign: "center",
                        }}
                    >
                        <strong style={{ color: "black", fontSize: "16px" }}>
                            {selectedDay}, {data.hour}
                        </strong>
                        <div style={{ marginTop: "8px" }}>
                            <Icon />
                            {props.OHDetails[data.hour].startHour} - {props.OHDetails[data.hour].endHour}
                            <br />
                            <Icon />
                            {props.OHDetails[data.hour].location}
                            <br />
                            <Icon />
                            TA(s): {props.OHDetails[data.hour].ta}
                            <br />
                            <Icon />
                            <strong>{value} minutes</strong> average wait time
                        </div>
                    </div>
                )}
                axisLeft={{
                    legendPosition: "middle",
                    legendOffset: -50,
                    legend: props.legend,
                }}
                axisBottom={{
                    legendPosition: "middle",
                    legendOffset: 40,
                    legend: "Hours",
                }}
                theme={{
                    axis: {
                        legend: {
                            text: {
                                fontSize: 16,
                                outlineWidth: 6,
                            },
                        },
                    },
                    grid: {
                        line: {
                            strokeWidth: 0,
                        },
                    },
                }}
            />
        </div>
    );
};

export default WaitTimeGraph;
