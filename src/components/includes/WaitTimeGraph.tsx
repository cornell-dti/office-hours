/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unused-prop-types */
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

    // eslint-disable-next-line no-console
    console.log("Current hour:", currentHour);

    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const scale = Math.min(1, vw / 1024);

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
        <div 
            style={{ 
                width: "100%",
                minWidth: 0,
                height: `${300 * scale + 150}px`, 
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: `${20 * scale}px`,
                    gap: `${10 * scale}px`,
                    flexWrap: "wrap",
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
                            padding: `${6 * scale}px ${10 * scale}px`,
                            borderRadius: "4px",
                            fontSize: `${12 * scale + 2}px`,
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                colors={(bar) => "#4285F4"}
                margin={{
                    top: 20 * scale,
                    right: vw < 768 ? 10 : 20,
                    bottom: 60,
                    left: vw < 768 ? 10 : 20,
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
                            padding: `${10 * scale}px`,
                            paddingRight:  `${25 * scale}px`,
                            border: "2px solid black",
                            fontSize: `${12 * scale + 4}px`,
                            borderRadius: "4px",
                            textAlign: "center",
                        }}
                    >
                        <strong style={{ color: "black" }}>
                            {selectedDay}, {data.hour}
                        </strong>
                        <div style={{ marginTop: `${8 * scale}px` }}>
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
                                fontSize: 16 * scale,
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