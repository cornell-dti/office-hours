/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
import * as React from "react";
import { useEffect, useState } from "react";
import { ResponsiveBar, BarDatum } from "@nivo/bar";
import rightArrowIcon from "../../media/RightArrow.svg";
import leftArrowIcon from "../../media/LeftArrow.svg";
import { getSessionTimeRange } from "../../firebasefunctions/waitTimeMap";

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
    courseId?: string; // Optional courseId to query session time ranges
    sessionStartTime?: FireTimestamp; // Optional: current session start time for fallback filtering
    sessionEndTime?: FireTimestamp; // Optional: current session end time for fallback filtering
};

// Convert time slot string (e.g., "7:00 AM") to Date object for comparison
const timeSlotToDate = (slot: string, date: Date): Date => {
    const [time, period] = slot.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr || '0', 10);
    
    if (period === 'PM' && hour !== 12) {
        hour += 12;
    } else if (period === 'AM' && hour === 12) {
        hour = 0;
    }
    
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate;
};

// Helper function to check if a date is in the current week or next week
const isInCurrentOrNextWeek = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get Monday of current week (ISO week starts on Monday)
    const currentMonday = new Date(today);
    const currentDay = today.getDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Convert Sunday=0 to Monday=0
    currentMonday.setDate(today.getDate() - daysToMonday);
    currentMonday.setHours(0, 0, 0, 0);
    
    // Get Monday of next week
    const nextMonday = new Date(currentMonday);
    nextMonday.setDate(currentMonday.getDate() + 7);
    
    // Get Sunday of next week (end of next week)
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);
    
    // Check if date is between current Monday and next Sunday (inclusive)
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    return dateToCheck >= currentMonday && dateToCheck <= nextSunday;
};

const WaitTimeGraph = (props: Props) => {
    // vw and scale declarations, important for responsiveness --annie
    const [vw, setVw] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setVw(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const scale = Math.min(1, vw / 1024);
    const today = new Date();
    // Memoizing this is important to avoid re-renders, since each Date object would be considered "new"
    const selectedDate = React.useMemo(
        () => new Date(props.selectedDateEpoch),
        [props.selectedDateEpoch]
    );
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const selectedDay = dayNames[(selectedDate.getDay() + 6) % 7]; // Adjust for Sunday=0
    
    // Check if the selected date is in the future
    const isFutureDate = selectedDate > today;
    
    // Check if selected date is in current week or next week
    const isInRelevantWeek = isInCurrentOrNextWeek(selectedDate);
    
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

    // State for filtered slots based on session times
    const [filteredSlots, setFilteredSlots] = React.useState<string[]>(props.timeKeys);

    // Fetch session time range and filter slots
    React.useEffect(() => {
        let ignore = false;
        async function loadSessionTimeRange() {

            // Check if there are office hours (using the prop directly for stability)
            const hasOfficeHoursCheck = typeof props.hasSessionsForSelectedDay === 'boolean' 
                ? props.hasSessionsForSelectedDay 
                : false;

            if (!props.courseId || !hasOfficeHoursCheck) {
                // If no courseId or no office hours, use all slots
                setFilteredSlots(props.timeKeys);
                return;
            }

            let timeRange = await getSessionTimeRange(props.courseId, selectedDate);
            if (ignore) return;

            // Fallback: if no sessions found for selected date, try using the current session's time
            if ((!timeRange.earliestStart || !timeRange.latestEnd) && props.sessionStartTime && props.sessionEndTime) {
                const sessionDate = props.sessionStartTime.toDate();
                const sessionStartDate = new Date(sessionDate);
                sessionStartDate.setHours(0, 0, 0, 0);
                const sessionEndDate = new Date(sessionDate);
                sessionEndDate.setHours(23, 59, 59, 999);
                
                // Only use session time if it's on the selected date
                if (sessionStartDate.toDateString() === selectedDate.toDateString()) {
                    timeRange = {
                        earliestStart: props.sessionStartTime.toDate(),
                        latestEnd: props.sessionEndTime.toDate()
                    };
                }
            }

            if (!timeRange.earliestStart || !timeRange.latestEnd) {
                // No sessions found, use all slots
                setFilteredSlots(props.timeKeys);
                return;
            }

            // Round earliest start down to nearest 30-minute slot
            const earliestStartRounded = new Date(timeRange.earliestStart);
            earliestStartRounded.setMinutes(
                Math.floor(earliestStartRounded.getMinutes() / 30) * 30
            );
            earliestStartRounded.setSeconds(0, 0);

            // Round latest end DOWN to nearest 30-minute slot (not up)
            // This ensures we only include slots that are actually part of the session
            const latestEndRounded = new Date(timeRange.latestEnd);
            latestEndRounded.setMinutes(
                Math.floor(latestEndRounded.getMinutes() / 30) * 30
            );
            latestEndRounded.setSeconds(0, 0);

            // Filter slots that fall within the session time range
            // Compare full Date objects to handle midnight boundaries correctly
            const filtered = props.timeKeys.filter(slot => {
                const slotDate = timeSlotToDate(slot, selectedDate);
                const earliestDate = new Date(selectedDate);
                earliestDate.setHours(earliestStartRounded.getHours(), earliestStartRounded.getMinutes(), 0, 0);
                
                const latestDate = new Date(selectedDate);
                latestDate.setHours(latestEndRounded.getHours(), latestEndRounded.getMinutes(), 0, 0);
                
                // Include slots that start at or after earliestStart and at or before latestEnd
                // Since slots are 30-minute intervals, we compare slot start times
                return slotDate >= earliestDate && slotDate <= latestDate;
            });

            // If no slots match, fall back to all slots
            if (filtered.length === 0) {
                setFilteredSlots(props.timeKeys);
            } else {
                setFilteredSlots(filtered);
            }
        }
        loadSessionTimeRange();
        return () => {
            ignore = true;
        };
    }, [props.courseId, props.timeKeys, props.hasSessionsForSelectedDay, 
        props.sessionStartTime, props.sessionEndTime, selectedDate]);

    // Windowed view over 30‑minute slots (show 6 consecutive slots)
    const slots = filteredSlots; // Use filtered slots instead of all timeKeys
    // Reset hourStart when filtered slots change
    React.useEffect(() => {
        setHourStart(0);
    }, [filteredSlots.length]);
    // currentHourLabel is not in the same format; default to start at 0 for simplicity
    const initialStart = 0;
    const windowSize = 6;
    const [hourStart, setHourStart] = React.useState<number>(initialStart);
    const hasPrevHours = hourStart > 0;
    const hasNextHours = hourStart + windowSize < slots.length;
    const visibleSlots = slots.slice(hourStart, hourStart + windowSize);

    // Keep chart margin centralized so overlays align with the plot area
    // responsive sizing by adjusting by vw and scale -- annie
    const chartMargin = React.useMemo(() => ({ 
        top: 15 * scale, 
        right: vw < 768 ? 10 : 20,
        bottom: 40 * scale, 
        left: 12 * scale
    }), [scale, vw]);
    // Visual gap between the bars and the separator line
    // Important to keep for responsiveness! - annie
    const baselineGapPx = (vw < 1418 && vw > 1279) ? -15 : (vw < 700) ? -15 : (vw < 920) ? -17 : -18;

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
        <div style={{ height: 200, position: "relative", paddingTop: 3, paddingBottom: 0 }}>
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
                    marginTop: "10px",
                    marginBottom: "10px",
                    gap: "3px",
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

            {/* Show message if date is outside current week or next week */}
            {!isInRelevantWeek && (
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
                    No current estimated times available.
                </div>
            )}

            {/* Show message if no office hours for this day (only for current/next week) */}
            {isInRelevantWeek && !hasOfficeHours && (
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
                    No office hours are scheduled for this day.
                </div>
            )}

            {/* Show message if office hours exist but no data available (only for current/next week) */}
            {isInRelevantWeek && hasOfficeHours && !hasData && (
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

            {/* Only show graph if date is in current/next week AND there are office hours AND data */}
            {isInRelevantWeek && hasOfficeHours && hasData && (
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
                    <div style={{height: 160}}>
                        <ResponsiveBar
                            data={transformData()}
                            keys={["waitTime"]}
                            indexBy="slot"
                            margin={chartMargin}
                            padding={0.2}
                            colors={(bar) => {
                                const currentTime = new Date();
                                const todayNormalized = new Date();
                                todayNormalized.setHours(0, 0, 0, 0);
                                
                                // Compare actual dates, not just day names
                                const selectedDateNormalized = new Date(selectedDate);
                                selectedDateNormalized.setHours(0, 0, 0, 0);
                                
                                const isTodayNormalized = 
                                    selectedDateNormalized.getTime() === todayNormalized.getTime();
                                const isFutureDateNormalized = selectedDateNormalized > todayNormalized;
                        
                                // If selected day is today, use the original time-based logic
                                if (isTodayNormalized) {
                                    const [time, period] = bar.data.slot.split(' ');
                                    const [hour, minute] = time.split(':');
                            
                                    // Set the bar start time based on the slot
                                    const barStartTime = new Date();
                                    barStartTime.setHours(
                                        period === 'PM' && hour !== '12' ? 
                                            parseInt(hour, 10) + 12 : 
                                            period === 'AM' && hour === '12' ? 
                                                0 : parseInt(hour, 10)
                                    );
                                    barStartTime.setMinutes(parseInt(minute, 10));
                                    barStartTime.setSeconds(0, 0);
                                    
                                    // Calculate the end time of this 30-minute slot
                                    const barEndTime = new Date(barStartTime);
                                    barEndTime.setMinutes(barEndTime.getMinutes() + 30);
                            
                                    // Check if current time falls within this slot (currently ongoing)
                                    const isCurrentSlot = currentTime >= barStartTime && currentTime < barEndTime;
                                    
                                    // Compare with current time
                                    if (barStartTime < currentTime && !isCurrentSlot) {
                                        return "#D9D9D9"; // Past time
                                    } 
                                    if (isCurrentSlot) {
                                        return "#6399D6"; // Current time block - darker blue
                                    } 
                                    return "#DAE9FC"; // Future time
                            
                                }
                                // If selected day is in the future, all bars should be blue (estimated styling)
                                if (isFutureDateNormalized) {
                                    return "#DAE9FC"; // Blue for future estimates
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
                    </div>

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