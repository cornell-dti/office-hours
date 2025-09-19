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
	const baselineGapPx = -35;

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
                colors={(bar) => (bar.data.hour === currentHourLabel ? "#4285F4" : "#D2E3FC")}
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
                        <strong>{props.OHDetails[data.hour].avgWaitTime || `${data.waitTime} minutes`}</strong>
                    </div>
                )}
				axisBottom={{
					legend: "",
					tickSize: 0,
					tickPadding: 14,
					tickRotation: 0,
					format: (tick) => (String(tick).includes(":00 ") ? String(tick) : ""),
				}}
                theme={{
                    axis: {
					legend: { text: { fontSize: 16, outlineWidth: 0 } },
					ticks: { text: { fontSize: 14, fill: "#111827", fontWeight:  "normal" } },
                        // Use default, subtle domain line to match analytics cards
                    },
                    tooltip: { container: { border: "none", padding: 0, boxShadow: "none", background: "transparent" } },
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