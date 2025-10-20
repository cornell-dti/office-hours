/* eslint-disable react/prop-types */
import * as React from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";
import rightArrowIcon from "../../media/Right Arrow.svg";
import leftArrowIcon from "../../media/Left Arrow.svg";

type Props = {
    barData: BarDatum[];
    timeKeys: string[];
    OHDetails: {
        [id: string]: {
            ta: string;
            location: string;
            startHour: string;
            endHour: string;
            avgWaitTime: string;
        };
    };
    selectedDateEpoch: number;
    hasSessionsForSelectedDay?: boolean; // optional override for scheduled day detection
};

const WaitTimeGraph = (props: Props) => {
    const today = new Date();
    const selectedDate = new Date(props.selectedDateEpoch);
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const selectedDay = dayNames[(selectedDate.getDay() + 6) % 7]; // Adjust for Sunday=0
    
    // Check if the selected date is in the future
    const isFutureDate = selectedDate > today;
    
    // Check if there are office hours for the selected day
    // Priority: use parent's session detection first (hard condition)
    // Only show graph if there are actually scheduled sessions
    const selectedDayData = props.barData.find((day: any) => day.dayOfWeek === selectedDay);
    const hasOfficeHours = typeof props.hasSessionsForSelectedDay === 'boolean' 
        ? props.hasSessionsForSelectedDay 
        : false;
    
    // Check if we have actual data (non-null values) for this day
    const hasData = selectedDayData && Object.values(selectedDayData).some(value => 
        typeof value === 'number' && value > 0
    );
    

    const currentHourLabel = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: true,
    })
        .format(today)
        .toLowerCase()
        .replace(" ", "");

    // Windowed view over 30‑minute slots (show 6 consecutive slots)
    const slots = props.timeKeys; // e.g. ["7:00 AM", "7:30 AM", ...]
    // currentHourLabel is not in the same format; default to start at 0 for simplicity
    const initialStart = 0;
    const windowSize = 6;
    const [hourStart, setHourStart] = React.useState<number>(initialStart);
    const hasPrevHours = hourStart > 0;
    const hasNextHours = hourStart + windowSize < slots.length;
    const visibleSlots = slots.slice(hourStart, hourStart + windowSize);

    // Keep chart margin centralized so overlays align with the plot area
    const chartMargin = React.useMemo(() => ({ top: 5, right: 12, bottom: 35, left: 12 }), []);
    // Visual gap between the bars and the separator line
    const baselineGapPx = -55;

    // Build data for the selected day and current window of 30‑minute slots
    const transformData = () => {
        const dayData = props.barData.find((d) => d.dayOfWeek === selectedDay);
        if (!dayData) return [] as { slot: string; waitTime: number; hour: string }[];

        const data: { slot: string; waitTime: number; hour: string }[] = [];
        visibleSlots.forEach((s) => {
            const value = Number((dayData as any)[s] ?? 0);
            data.push({ slot: s, waitTime: value, hour: s });
        });
        return data;
    };

    return (
        <div style={{ height: 140, position: "relative", paddingTop: 3, paddingBottom: 0 }}>
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
            {/* Day selection buttons - now synchronized with calendar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "20px",
                    gap: "10px",
                }}
            >
                {dayNames.map((dayName) => {
                    const isToday = dayName === dayNames[(today.getDay() + 6) % 7];
                    const isSelected = dayName === selectedDay;
                    
                    return (
                        <div
                            key={dayName}
                            style={{
                                backgroundColor: isSelected ? "#e6e9ef" : "transparent",
                                color: isSelected ? "#4d4d4d" : "#6b7280",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "default",
                                fontWeight: isSelected ? 600 : 400,
                                fontSize: "13px",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {isToday ? "TODAY" : dayName.slice(0, 3).toUpperCase()}
                        </div>
                    );
                })}
            </div>

            {/* Show message if no office hours for this day */}
            {!hasOfficeHours && (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "40px",
                        marginBottom: "40px",
                        fontSize: "14px",
                        color: "#666",
                        fontStyle: "italic",
                    }}
                >
                    No office hours are scheduled for today.
                </div>
            )}

            {/* Show message if office hours exist but no data available */}
            {hasOfficeHours && !hasData && (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "40px",
                        marginBottom: "40px",
                        fontSize: "14px",
                        color: "#666",
                        fontStyle: "italic",
                    }}
                >
                    There is no data available for the day you have chosen.
                </div>
            )}

            {/* Only show graph if there are office hours AND data */}
            {hasOfficeHours && hasData && (
                <>
                    {/* Side arrows, vertically centered beside the bars */}
                    <button
                        type="button"
                        onClick={() => setHourStart((s) => Math.max(0, s - windowSize))}
                        disabled={!hasPrevHours}
                        style={{
                            position: "absolute",
                            left: -6,
                            top: "50%",
                            transform: "translateY(-30%)",
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
                        onClick={() => setHourStart((s) => Math.min(slots.length - windowSize, s + windowSize))}
                        disabled={!hasNextHours}
                        style={{
                            position: "absolute",
                            right: -6,
                            top: "50%",
                            transform: "translateY(-30%)",
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
                        margin={chartMargin}
                        padding={0.2}
                        colors={(bar) => {
                            const currentTime = new Date();
                            const today = new Date();
                    
                            // Get the selected day index (0 = Monday, 1 = Tuesday, etc.)
                            const dayNames = [
                                "Monday", "Tuesday", "Wednesday", "Thursday", 
                                "Friday", "Saturday", "Sunday"
                            ];
                            const selectedDayIndex = dayNames.indexOf(selectedDay);
                            const todayIndex = (today.getDay() + 6) % 7; // Adjust for Monday-first order
                    
                            // If selected day is today, use the original time-based logic
                            if (selectedDayIndex === todayIndex) {
                                const barTime = new Date();
                                const [time, period] = bar.data.slot.split(' ');
                                const [hour, minute] = time.split(':');
                        
                                // Set the bar time based on the slot
                                barTime.setHours(
                                    period === 'PM' && hour !== '12' ? 
                                        parseInt(hour, 10) + 12 : 
                                        period === 'AM' && hour === '12' ? 
                                            0 : parseInt(hour, 10)
                                );
                                barTime.setMinutes(parseInt(minute, 10));
                        
                                // Compare with current time
                                if (barTime < currentTime) {
                                    return "#D9D9D9"; // Past time
                                } if (bar.data.hour === currentHourLabel) {
                                    return "#6399D6"; // Current time
                                } 
                                return "#DAE9FC"; // Future time
                        
                            }
                            // If selected day is in the future, use estimated styling
                            if (selectedDayIndex > todayIndex) {
                                return "#E8F4FD"; // Lighter blue for estimates
                            }
                            // If selected day is in the past, all bars are past time
                    
                            return "#D9D9D9"; // Past time
                    
                        }}
                        axisLeft={null}
                        enableGridY={false}
                        enableLabel={false}
                        isInteractive={true}
                        tooltip={({ data }) => {
                            const oh = (props.OHDetails as any) || {};
                            const ohForSlot = data && (data as any).hour ? oh[(data as any).hour] : undefined;
                            const wait = typeof (data as any).waitTime === "number" ? 
                                Math.round(Number((data as any).waitTime)) : undefined;
                            return (
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
                                    <div style={{ 
                                        fontSize: "13px", 
                                        fontWeight: "normal", 
                                        color: "#333" 
                                    }}
                                    >
                                        On {selectedDay.slice(0, 3)} at {
                                            (data as any).slot
                                        }
                                    </div>
                                    <div style={{ 
                                        fontSize: "13px", 
                                        fontWeight: "normal", 
                                        color: "#333" 
                                    }}
                                    >
                                        <strong>Est Wait:</strong> {
                                            wait !== undefined ? `${wait} min` : "No data"
                                        }
                                    </div>
                                    {isFutureDate && (
                                        <div style={{ 
                                            fontSize: "12px", 
                                            fontWeight: "normal", 
                                            color: "#666", 
                                            fontStyle: "italic" 
                                        }}
                                        >
                                            Based on historical data
                                        </div>
                                    )}
                                    {ohForSlot && (
                                        <div style={{ 
                                            fontSize: "12px", 
                                            marginTop: 6, 
                                            color: "#374151" 
                                        }}
                                        >
                                            {ohForSlot.location && (
                                                <div>
                                                    <strong>Location:</strong> {ohForSlot.location}
                                                </div>
                                            )}
                                            {ohForSlot.ta && (
                                                <div>
                                                    <strong>TA:</strong> {ohForSlot.ta}
                                                </div>
                                            )}
                                            {(ohForSlot.startHour || ohForSlot.endHour) && (
                                                <div>
                                                    <strong>Time:</strong> {ohForSlot.startHour} {
                                                        ohForSlot.endHour ? `– ${ohForSlot.endHour}` : ""
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                        theme={{
                            axis: {
                                legend: { text: { fontSize: 16, outlineWidth: 0 } },
                                ticks: { 
                                    text: { 
                                        fontSize: 13, 
                                        fill: "#111827", 
                                        fontWeight: "300" 
                                    } 
                                },
                                // Use default, subtle domain line to match analytics cards
                            },
                            tooltip: { 
                                container: { 
                                    border: "none", 
                                    padding: 0, 
                                    boxShadow: "none", 
                                    background: "transparent" 
                                } 
                            },
                        }}
                        axisBottom={{
                            legend: "",
                            tickSize: 0,
                            tickPadding: 10,
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
                </>
            )}
        </div>
    );
};

export default WaitTimeGraph;