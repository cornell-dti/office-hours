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
    const currentHourLabel = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: true,
    })
        .format(today)
        .toLowerCase()
        .replace(" ", "");

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
                            backgroundColor: selectedDay === dayName ? "#e6e9ef" : "#f6f7fb",
                            color: "#4d4d4d",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 500,
                            fontSize: "14px",
                        }}
                    >
                        {dayName === dayOfWeek ? "TODAY" : dayName.slice(0, 3).toUpperCase()}
                    </button>
                ))}
            </div>

            <ResponsiveBar
                data={transformData()}
                keys={["waitTime"]}
                indexBy="hour"
                borderWidth={0}
                colors={(bar) => (bar.data.hour === currentHourLabel ? "#5B8DEF" : "#DCE7FF")}
                margin={{
                    top: 10,
                    right: 20,
                    bottom: 60,
                    left: 55,
                }}
                borderRadius={6}
                padding={0.18}
                enableLabel={false}
                tooltip={({ value, data }) => (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "10px 16px",
                            border: "1px solid #D0D7E2",
                            borderRadius: "8px",
                            textAlign: "center",
                            background: "#ffffff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
                    legendOffset: -45,
                    legend: props.legend,
                    tickSize: 0,
                    tickPadding: 8,
                }}
                axisBottom={{
                    legendPosition: "middle",
                    legendOffset: 40,
                    legend: "Hours",
                    tickPadding: 10,
                }}
                theme={{
                    axis: {
                        legend: {
                            text: {
                                fontSize: 16,
                                outlineWidth: 0,
                            },
                        },
                        ticks: {
                            text: {
                                fontSize: 12,
                                fill: "#6b7280",
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