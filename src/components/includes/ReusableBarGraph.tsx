import * as React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { useMemo } from "react";

type Props = {
    barData: {
        dayOfWeek: string;
        value: string;
        detail: string;
    }[];
    title?: string;
    subtitle?: string | React.ReactNode;
};

const ReusableBarGraph = (props: Props) => {
    const today = useMemo(() => {
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
        <div className="bar-graph-container">
            {props.title && (
                <h2>
                    {props.title}
                </h2>
            )}

            {props.subtitle && (
                <div className="subtitle">
                    {props.subtitle}
                </div>
            )}
            <div className="graph">
                <ResponsiveBar
                    data={formattedData}
                    keys={["value"]}
                    indexBy="dayOfWeek"
                    margin={{ top: 20, right: 15, bottom: 30, left: 15 }}
                    padding={0.05}
                    maxValue={maxValue}
                    colors={(bar) => (bar.indexValue === today ? "#5599DB" : "#DAE9FC")}
                    axisBottom={{
                        tickSize: 0,
                        tickPadding: 5,
                        tickRotation: 0,
                    }}
                    axisLeft={null}
                    enableGridY={false}
                    enableLabel={false}
                    tooltip={({ data }) => {
                        const [boldPart, ...rest] = (typeof data.detail === "string" ? data.detail : "").split(" ");

                        return (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    background: "white",
                                    padding: "8px",
                                    width: "85px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.1)",
                                    position: "absolute",
                                }}
                            >
                                <span>
                                    <strong>{boldPart} {rest[0]}</strong> {rest.slice(1).join(" ")}
                                </span>
                            </div>
                        );
                    }}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: "#000",
                                    fontFamily: "Roboto",
                                    fontSize: 12,
                                    fontStyle: "normal",
                                    fontWeight: 400,
                                    lineHeight: "normal",
                                    paddingTop: "8px",
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
