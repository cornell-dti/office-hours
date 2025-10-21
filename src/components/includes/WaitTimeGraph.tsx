/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unused-prop-types */
import * as React from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";
// import { Icon } from "semantic-ui-react";
import rightArrowIcon from "../../media/RightArrow.svg";
import leftArrowIcon from "../../media/LeftArrow.svg";

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

    const currentHourLabel = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: true,
    })
        .format(today)
        .toLowerCase()
        .replace(" ", "");

    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const scale = Math.min(1, vw / 1024);

    // Windowed 3-hour view with 30-minute slots (6 columns)
    const hours = props.timeKeys; // e.g. ["7pm", "8pm", ...]
    const currentHourIndex = Math.max(0, hours.findIndex((h) => h === currentHourLabel));
    const initialStart = Math.max(0, Math.min(currentHourIndex, hours.length - 3));
    const [hourStart, setHourStart] = React.useState<number>(initialStart);
    const hasPrevHours = hourStart > 0;
    const hasNextHours = hourStart + 3 < hours.length;
    const visibleHours = hours.slice(hourStart, hourStart + 3);

    const parseHour = (h: string) => {
        // "7pm" -> { hour: 7, ampm: "PM" }
        const num = parseInt(h, 10);
        const ampm = h.includes("pm") ? "PM" : "AM";
        return { hour: num === 0 ? 12 : num, ampm };
    };

    const formatHalfLabel = (h: string, half: 0 | 30) => {
        const { hour, ampm } = parseHour(h);
        return `${hour}:${half.toString().padStart(2, "0")} ${ampm}`;
    };

    // Keep chart margin centralized so overlays align with the plot area
    // check this responsive sizing
    const chartMargin = React.useMemo(() => ({ 
        top: 15 * scale, 
        right: vw < 768 ? 10 : 20, // was 12 before check this
        bottom: 40, 
        left: 12 * scale  // was 55 before check this
    }), []);
    // Visual gap between the bars and the separator line
    const baselineGapPx = -30;

    // Build 6-slot data for the selected day and current 3-hour window
    const transformData = () => {
        const dayData = props.barData.find((d) => d.dayOfWeek === selectedDay);
        if (!dayData) return [] as { slot: string; waitTime: number; hour: string }[];

        const slots: { slot: string; waitTime: number; hour: string }[] = [];
        visibleHours.forEach((h) => {
            // Split each hour into two half-hour slots. Use the hour's value for both (no finer granularity available).
            slots.push({ slot: formatHalfLabel(h, 0), waitTime: Number(dayData[h] as unknown as number), hour: h });
            slots.push({ slot: formatHalfLabel(h, 30), waitTime: Number(dayData[h] as unknown as number), hour: h });
        });
        return slots;
    };

    return (
        <div 
            style={{ 
                width: "100%",
                minWidth: 0,
                height: `${140 * scale + 150}px`, 
                position: "relative"
            }}
        >
            {/* this part confuses me a bit, check for responsiveness */}
            <style>
                {`
                    /* Target only the actual bar rectangles, not the container or other SVG elements */
                    svg rect[fill="#D9D9D9"]:hover,
                    svg rect[fill="#6399D6"]:hover,
                    svg rect[fill="#DAE9FC"]:hover {
                        fill: #6399D6 !important;
                        opacity: 0.4 !important;
                        transition: fill 0.2s ease, opacity 0.2s ease !important;
                    }
                    /* Ensure only bar rectangles have transition for fill and opacity only */
                    svg rect[fill="#D9D9D9"],
                    svg rect[fill="#6399D6"],
                    svg rect[fill="#DAE9FC"] {
                        transition: fill 0.2s ease, opacity 0.2s ease;
                    }
                    /* Prevent any transitions on the chart container that might affect positioning */
                    .nivo-bar,
                    .nivo-bar-rect,
                    svg {
                        transition: none !important;
                    }
                    /* Only allow transitions on the specific bar rectangles */
                    svg rect[fill="#D9D9D9"],
                    svg rect[fill="#6399D6"],
                    svg rect[fill="#DAE9FC"] {
                        transition: fill 0.2s ease, opacity 0.2s ease !important;
                    }
                `}
            </style>
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
                            backgroundColor: selectedDay === dayName ? "#e6e9ef" : "transparent",
                            color: selectedDay === dayName ? "#4d4d4d" : "#6b7280",
                            border: "none",
                            padding: `${6 * scale}px ${12 * scale}px`,
                            borderRadius: "6px",
                            fontSize: `${13 * scale}px`,
                            fontWeight: selectedDay === dayName ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {dayName === dayOfWeek ? "TODAY" : dayName.slice(0, 3).toUpperCase()}
                    </button>
                ))}
            </div>
            
            {/* check this section for responsiveness -- pulled from layla's */}
            {/* Side arrows, vertically centered beside the bars */}
            <button
                type="button"
                onClick={() => setHourStart((s) => Math.max(0, s - 1))}
                disabled={!hasPrevHours}
                style={{
                    position: "absolute",
                    left: -6,
                    top: "50%",
                    transform: "translateY(-30%)",
                    // background: "#fff",
                    // border: "1px solid #e5e7eb",
                    // borderRadius: 9999,
                    background: "transparent",
                    border: "none",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: hasPrevHours ? 1 : 0.4,
                    cursor: hasPrevHours ? "pointer" : "default",
                    zIndex: 10,
                }}
            >
                <img src={leftArrowIcon} alt="prev hours" style={{ width: 14, height: 14 }} />
            </button>
            <button
                type="button"
                onClick={() => setHourStart((s) => Math.min(hours.length - 3, s + 1))}
                disabled={!hasNextHours}
                style={{
                    position: "absolute",
                    right: -6,
                    top: "50%",
                    transform: "translateY(-30%)",
                    // background: "#fff",
                    // border: "1px solid #e5e7eb",
                    // borderRadius: 9999,
                    background: "transparent",
                    border: "none",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: hasNextHours ? 1 : 0.4,
                    cursor: hasNextHours ? "pointer" : "default",
                    zIndex: 10,
                }}
            >
                <img src={rightArrowIcon} alt="next hours" style={{ width: 14, height: 14 }} />
            </button>

            <ResponsiveBar
                data={transformData()}
                keys={["waitTime"]}
                indexBy="slot"
                borderWidth={0}
                // colors={(bar) => (bar.data.hour === currentHourLabel ? "#5B8DEF" : "#DCE7FF")}
                colors={(bar) => {
                    const currentTime = new Date();
                    // const barTime = new Date();
                    // const [time, period] = bar.data.slot.split(' ');
                    // const [hour, minute] = time.split(':');
                    const today = new Date();

                    // // Set the bar time based on the slot
                    // barTime.setHours(period === 'PM' && hour !== '12' ? parseInt(hour, 10) + 12 : 
                    //     period === 'AM' && hour === '12' ? 0 : parseInt(hour, 10));
                    // barTime.setMinutes(parseInt(minute, 10));

                    // Get the selected day index (0 = Sunday, 1 = Monday, etc.)
                    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const selectedDayIndex = dayNames.indexOf(selectedDay);
                    const todayIndex = today.getDay();

                    // If selected day is today, use the original time-based logic
                    if (selectedDayIndex === todayIndex) {
                        const barTime = new Date();
                        const [time, period] = bar.data.slot.split(' ');
                        const [hour, minute] = time.split(':');

                        // Set the bar time based on the slot
                        barTime.setHours(period === 'PM' && hour !== '12' ? parseInt(hour, 10) + 12 : 
                            period === 'AM' && hour === '12' ? 0 : parseInt(hour, 10));
                        barTime.setMinutes(parseInt(minute, 10));

                        // Compare with current time
                        if (barTime < currentTime) {
                            return "#D9D9D9"; // Past time
                        } if (bar.data.hour === currentHourLabel) {
                            return "#6399D6"; // Current time
                        } 
                        return "#DAE9FC"; // Future time
                        
                    }
                    if (selectedDayIndex > todayIndex) {
                        return "#DAE9FC"; // Future time
                    }
                    // If selected day is in the past, all bars are past time
                    
                    return "#D9D9D9"; // Past time
                    

                    // // Compare with current time
                    // if (barTime < currentTime) {
                    //     return "#D9D9D9"; // Past time
                    // }
                    // if (bar.data.hour === currentHourLabel) {
                    //     return "#6399D6"; // Current time
                    // }
                    // return "#DAE9FC"; // Future time
                }}
                margin={chartMargin}
                padding={0.2}
                axisLeft={null}
                enableGridY={false}
                enableLabel={false}
                isInteractive={true}
                tooltip={({ data }) => (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            // justifyContent: "center",
                            // alignItems: "center",
                            padding: `${8 * scale}px ${12 * scale}px`,
                            // border: "1px solid #D0D7E2",
                            background: "white",
                            fontSize: `${13 * scale + 4}px`,
                            borderRadius: "8px",
                            textAlign: "left",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            gap: "2px"
                        }}
                    >
                        {/* <strong style={{ color: "black" }}>
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
                        </div> */}
                        {/* <strong>{props.OHDetails[data.hour].avgWaitTime || `${data.waitTime} minutes`}</strong> */}
                        <div style={{ fontSize: "13px", fontWeight: "normal", color: "#333" }}>
                            At {data.slot}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "normal", color: "#333" }}>
                            <strong>Est Wait:</strong> 
                            {props.OHDetails[data.hour].avgWaitTime || `${data.waitTime} min`}
                        </div>
                    </div>
                )}
                // axisLeft={{
                //     legendPosition: "middle",
                //     legendOffset: -45,
                //     legend: props.legend,
                //     tickSize: 0,
                //     tickPadding: 8,
                // }}
                axisBottom={{
                    // legendPosition: "middle",
                    // legendOffset: 40,
                    // legend: "Hours",
                    // tickPadding: 10,
                    legend: "",
                    tickSize: 0,
                    tickPadding: 8,
                    tickRotation: 0,
                    format: (tick) => (String(tick).includes(":00 ") ? String(tick) : ""),
                }}
                theme={{
                    axis: {
                        legend: {
                            text: {
                                fontSize: 16 * scale,
                                outlineWidth: 0,
                            },
                        },
                        ticks: {
                            text: {
                                fontSize: 13 * scale,
                                fill: "#111827",
                                fontWeight: 300
                            },
                        },
                    },
                    // grid: {
                    //     line: {
                    //         strokeWidth: 0,
                    //     },
                    // },
                    // added below, check if necessary?
                    tooltip: { 
                        container: { 
                            border: "none", 
                            padding: 0, 
                            boxShadow: "none", 
                            background: "transparent" 
                        } 
                    },
                }}
            />
            {/* Separator line and soft white fade just above the x-axis to create a hover effect */}
            <div
                style={{
                    position: "absolute",
                    left: chartMargin.left,
                    right: chartMargin.right,
                    bottom: chartMargin.bottom + baselineGapPx,
                    height: 18,
                    pointerEvents: "none",
                    zIndex: 5,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: chartMargin.left,
                    right: chartMargin.right,
                    bottom: chartMargin.bottom + baselineGapPx,
                    height: 1.25,
                    background: "rgba(17, 24, 39, 0.85)",
                    borderRadius: 0.5,
                    pointerEvents: "none",
                    zIndex: 6,
                }}
            />
        </div>
    );
};

export default WaitTimeGraph;