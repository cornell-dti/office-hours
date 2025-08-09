import * as React from "react";
import { ResponsiveBar } from "@nivo/bar";

type Props = {
    barData: {
        dayOfWeek: string;
        value: string;
        detail: string;
    }[];
    dayKeys: string[];
    title?: string;
    subtitle?: string;
};

const ReusableBarGraph = (props: Props) => {
    const today = React.useMemo(() => {
        const date = new Date();
        const dayOfWeek = date.getDay();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[dayOfWeek].substring(0, 3);
    }, []);
    const transformData = () => {
        return props.barData.map((data) => ({
            dayOfWeek: data.dayOfWeek.substring(0, 3),
            value: Number(data.value),
            detail: data.detail,
        }));
    };

    const formattedData = transformData();
    // Find the max value for proper scaling
    const maxValue = Math.max(...formattedData.map((data) => Number(data.value))) * 1.2; // Add 20% headroom

    return (
        <div
            style={{
                height: "auto",
                width: "100%",
                padding: "20px 20px 15px 20px",
                fontFamily: "sans-serif",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "8px",
            }}
        >
            {props.title && (
                <h2
                    style={{
                        margin: "0 0 5px 0",
                        fontSize: "22px",
                        fontWeight: "bold",
                        color: "#333",
                        textAlign: "left",
                    }}
                >
                    {props.title}
                </h2>
            )}

            {props.subtitle && (
                <div
                    style={{
                        fontSize: "14px",
                        color: "#333",
                        textAlign: "left",
                    }}
                >
                    {props.subtitle}
                </div>
            )}
            <div style={{ height: 160, flexGrow: 1 }}>
                <ResponsiveBar
                    data={formattedData}
                    keys={["value"]}
                    indexBy="dayOfWeek"
                    margin={{ top: 20, right: 15, bottom: 30, left: 15 }}
                    padding={0.05}
                    maxValue={maxValue}
                    colors={(bar) => (bar.indexValue === today ? "#4285F4" : "#D2E3FC")}
                    axisBottom={{
                        tickSize: 0,
                        tickPadding: 5,
                        tickRotation: 0,
                    }}
                    axisLeft={null}
                    enableGridY={false}
                    enableLabel={false}
                    tooltip={({ data }) => (
                        <div
                            style={{
                                background: "white",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                        >
                            <strong>{data.detail}</strong>
                        </div>
                    )}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fontSize: 11,
                                    fill: "#333",
                                    fontWeight: "normal",
                                },
                            },
                        },
                        tooltip: {
                            container: {
                                border: "none",
                                padding: 0,
                                boxShadow: "none",
                                background: "transparent",
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default ReusableBarGraph;
