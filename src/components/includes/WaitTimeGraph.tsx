import * as React from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";
import { Icon } from "semantic-ui-react";
import rightArrowIcon from "../../media/rightArrowIcon.svg";
import leftArrowIcon from "../../media/leftArrowIcon.svg";

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
	const chartMargin = React.useMemo(() => ({ top: 30, right: 12, bottom: 64, left: 12 }), []);
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
        <div style={{ height: 240, position: "relative" }}>
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
                    marginTop: "20px",
                    gap: "10px",
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
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: selectedDay === dayName ? 600 : 400,
                            fontSize: "13px",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {dayName === dayOfWeek ? "TODAY" : dayName.slice(0, 3).toUpperCase()}
                    </button>
                ))}
            </div>

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
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 9999,
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
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 9999,
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
				margin={chartMargin}
                padding={0.2}
                colors={(bar) => {
                    const currentTime = new Date();
                    const today = new Date();
                    
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
                        barTime.setHours(period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : 
                                       period === 'AM' && hour === '12' ? 0 : parseInt(hour));
                        barTime.setMinutes(parseInt(minute));
                        
                        // Compare with current time
                        if (barTime < currentTime) {
                            return "#D9D9D9"; // Past time
                        } else if (bar.data.hour === currentHourLabel) {
                            return "#6399D6"; // Current time
                        } else {
                            return "#DAE9FC"; // Future time
                        }
                    }
                    // If selected day is in the future, all bars are future time
                    else if (selectedDayIndex > todayIndex) {
                        return "#DAE9FC"; // Future time
                    }
                    // If selected day is in the past, all bars are past time
                    else {
                        return "#D9D9D9"; // Past time
                    }
                }}
                axisLeft={null}
                enableGridY={false}
                enableLabel={false}
                isInteractive={true}
                tooltip={({ data }) => (
                    <div
                        style={{
                            background: "white",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            textAlign: "left",
                        }}
                    >
                        <div style={{ fontSize: "13px", fontWeight: "normal", color: "#333" }}>
                            At {data.slot}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "normal", color: "#333" }}>
                            <strong>Est Wait:</strong> {props.OHDetails[data.hour].avgWaitTime || `${data.waitTime} min`}
                        </div>
                    </div>
                )}
                theme={{
                    axis: {
                        legend: { text: { fontSize: 16, outlineWidth: 0 } },
                        ticks: { text: { fontSize: 14, fill: "#111827", fontWeight:  "normal" } },
                        // Use default, subtle domain line to match analytics cards
                    },
                    tooltip: { container: { border: "none", padding: 0, boxShadow: "none", background: "transparent" } },
                }}
				axisBottom={{
					legend: "",
					tickSize: 0,
					tickPadding: 14,
					tickRotation: 0,
					format: (tick) => (String(tick).includes(":00 ") ? String(tick) : ""),
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