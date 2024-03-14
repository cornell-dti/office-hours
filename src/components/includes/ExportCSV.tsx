import React, { useState } from "react";
import { Form, Icon, Radio } from "semantic-ui-react";
import { FormControl, FormLabel, Grid, MenuItem, Select, Checkbox, FormControlLabel } from "@material-ui/core";
import moment from "moment";
import { pickBy } from "lodash";
import { useCourseUsersMap, useCoursesBetweenDates } from "../../firehooks";
import CloseIcon from "../../media/CloseIcon.svg";
import ExportIcon from "../../media/ExportIcon.svg";
import ExportIcon2 from "../../media/ExportIcon2.svg";

type Props = {
    setShowModal: (show: boolean) => void;
    showModal: boolean;
    courseId: string;
};

// csv column labels
const sessionDataLabels: { [key: string]: string } = {
    sessionTitle: "Session Title",
    sessionStartTime: "Session Start Time",
    sessionEndTime: "Session End Time",
    taNames: "TA Names",
    taNetIDs: "TA NetIDs",
    sessionWaitTime: "Average Wait Time (minutes)",
    sessionNumQuestions: "Number of Questions",
    sessionPercentResolved: "Questions Resolved (%)",
    // sessionRating: "Rating", add later when rating is implemented/merged to main
};

// csv row data
type sessionRowData = {
    sessionTitle: string;
    sessionStartTime?: string;
    sessionEndTime?: string;
    taNames?: string;
    taNetIDs?: string;
    sessionWaitTime?: string; // average wait time
    sessionNumQuestions?: string;
    sessionPercentResolved?: string;
    // sessionRating: string; add later when rating is implemented/merged
};

// semester start and end dates
const fallStart = {
    month: 7,
    date: 2,
};
const fallEnd = {
    month: 11,
    date: 25,
};
const springStart = {
    month: 0,
    date: 2,
};
const springEnd = {
    month: 4,
    date: 25,
};

const ExportCSVModal = ({ setShowModal, showModal, courseId }: Props) => {
    const [showSemPicker, setShowSemPicker] = useState<boolean>(true); // true for semester, false for date

    // analytics options
    const [includeName, setIncludeName] = useState<boolean>(true);
    const [includeNetID, setIncludeNetID] = useState<boolean>(true);
    const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(true);
    const [includeQuestion, setIncludeQuestion] = useState<boolean>(true);
    const [includeWaitTime, setIncludeWaitTime] = useState<boolean>(true);
    const [includeRating, setIncludeRating] = useState<boolean>(false);

    // years for semester picker
    const yearArray = Array.from({ length: new Date().getFullYear() - 2017 + 1 }, (_value, index) => 2017 + index);

    // see if today is fall semester or spring semester
    const todayIsFall = moment(new Date()).isBetween(
        moment(new Date()).set({ ...fallStart, year: moment(new Date()).year() }),
        moment(new Date()).set({ ...fallEnd, year: moment(new Date()).year() })
    );

    const [isFall, setIsFall] = useState<boolean>(todayIsFall); // true for fall, false for spring

    const todayStart = todayIsFall ? fallStart : springStart;
    const todayEnd = todayIsFall ? fallEnd : springEnd;

    // default start date is semester start, default end date is semester end
    const [startDate, setStartDate] = useState<moment.Moment>(
        moment(new Date()).set({ ...todayStart, year: moment(new Date()).year() })
    );
    const [endDate, setEndDate] = useState<moment.Moment>(
        moment(new Date()).set({ ...todayEnd, year: moment(new Date()).year() })
    );

    // analytics calculations
    const { sessions } = useCoursesBetweenDates(startDate, endDate, courseId);
    const courseUsers = useCourseUsersMap(courseId, true);

    // calculates session data
    const generateSessionData = () => {
        const sessionData: sessionRowData[] = [];
        sessions.forEach((session) => {
            const sessionTitle = session.title ?? "No Title";
            const formatOptions: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            };
            const sessionStartTime = '"' + session.startTime.toDate().toLocaleString("en-US", formatOptions) + '"';
            const sessionEndTime = '"' + session.endTime.toDate().toLocaleString("en-US", formatOptions) + '"';
            const taNames =
                session.tas.length === 0
                    ? ""
                    : '"' +
                      session.tas
                          .map((userId) => {
                              const courseUser = courseUsers[userId];
                              if (courseUser === undefined) {
                                  return "unknown";
                              }
                              return `${courseUser.firstName} ${courseUser.lastName}`;
                          })
                          .join(", ") +
                      '"';
            const taNetIDs =
                session.tas.length === 0
                    ? ""
                    : '"' +
                      session.tas
                          .map((userId) => {
                              const courseUser = courseUsers[userId];
                              if (courseUser === undefined) {
                                  return "unknown";
                              }
                              // gets netid from cornell email (netid@cornell.edu)
                              return courseUser.email.search("@") !== -1
                                  ? courseUser.email.split("@")[0]
                                  : courseUser.email;
                          })
                          .join(", ") +
                      '"';
            const waitTime = session.totalWaitTime / session.totalQuestions;
            const sessionWaitTime = isNaN(waitTime) ? "" : Math.round(waitTime).toString();
            const sessionNumQuestions = session.totalQuestions.toString();
            const percentResolved = (session.resolvedQuestions / session.totalQuestions) * 100;
            const sessionPercentResolved = isNaN(percentResolved) ? "" : percentResolved.toFixed(2);

            const sessionDataElement = {
                sessionTitle,
                sessionStartTime: includeTimestamp ? sessionStartTime : undefined,
                sessionEndTime: includeTimestamp ? sessionEndTime : undefined,
                taNames: includeName ? taNames : undefined,
                taNetIDs: includeNetID ? taNetIDs : undefined,
                sessionWaitTime: includeWaitTime ? sessionWaitTime : undefined,
                sessionNumQuestions: includeQuestion ? sessionNumQuestions.toString() : undefined,
                sessionPercentResolved: includeQuestion ? sessionPercentResolved : undefined,
            };
            // filters out undefined values from row
            const sessionDataElementCleaned = pickBy(sessionDataElement, (v) => v !== undefined) as sessionRowData;
            sessionData.push(sessionDataElementCleaned);
        });
        return sessionData;
    };

    const convertSessionDataToCSV = (sessionData: sessionRowData[]) => {
        if (sessionData.length === 0) {
            return "";
        }
        const headerRow =
            Object.keys(sessionData[0])
                .map((key) => sessionDataLabels[key])
                .join(",") ?? "";
        const csvRows = sessionData.map((session) => {
            return Object.values(pickBy(session, (v) => v !== undefined)).join(",");
        });
        const csvString = headerRow + "\r\n" + csvRows.join("\r\n");
        return csvString;
    };

    const handleExportCSV = () => {
        const sessionData = generateSessionData();
        const csvString = convertSessionDataToCSV(sessionData);
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8," });

        // download logic
        const a = document.createElement("a");
        a.download = "session-data.csv";
        a.href = URL.createObjectURL(blob);
        a.addEventListener("click", () => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        });
        a.click();
    };

    return (
        <>
            {showModal && (
                <div className="export-csv-background">
                    <div className="export-csv-container">
                        <button className="close-button" onClick={() => setShowModal(false)} type="button">
                            <img src={CloseIcon} alt="Close modal" />
                        </button>

                        <img src={ExportIcon} className="export-icon" alt="Export" />
                        <h2>Export Queue Data</h2>

                        <Form>
                            <div className="time-interval">
                                <p>Select time interval by</p>

                                <div className="row">
                                    <Radio
                                        label="Semester"
                                        className="radioCheckbox"
                                        value="Semester"
                                        checked={showSemPicker}
                                        onChange={() => setShowSemPicker(true)}
                                    />
                                    <Radio
                                        label="Date"
                                        className="radioCheckbox"
                                        value="Date"
                                        checked={!showSemPicker}
                                        onChange={() => setShowSemPicker(false)}
                                    />
                                </div>
                            </div>

                            {showSemPicker ? (
                                <div className="select-semester">
                                    <div className="row">
                                        <FormControl
                                            variant="outlined"
                                            size="small"
                                            style={{
                                                width: "50%",
                                                textAlign: "left",
                                                marginRight: 20,
                                            }}
                                        >
                                            <FormLabel className="label">Year</FormLabel>
                                            <Select
                                                value={startDate.year()}
                                                IconComponent={() => <Icon name="chevron down" size="small" />}
                                                MenuProps={{
                                                    anchorOrigin: {
                                                        vertical: "bottom",
                                                        horizontal: "left",
                                                    },
                                                    transformOrigin: {
                                                        vertical: "top",
                                                        horizontal: "left",
                                                    },
                                                    getContentAnchorEl: null,
                                                }}
                                                onChange={(e) => {
                                                    setStartDate(startDate.clone().year(e.target.value as number));
                                                    setEndDate(endDate.clone().year(e.target.value as number));
                                                }} // edit date
                                            >
                                                {yearArray.map((year) => (
                                                    <MenuItem value={year}>{year}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl
                                            variant="outlined"
                                            size="small"
                                            style={{
                                                width: "50%",
                                                textAlign: "left",
                                                marginRight: 20,
                                            }}
                                        >
                                            <FormLabel className="label">Term</FormLabel>
                                            <Select
                                                value={isFall ? "Fall" : "Spring"}
                                                IconComponent={() => <Icon name="chevron down" size="small" />}
                                                MenuProps={{
                                                    anchorOrigin: {
                                                        vertical: "bottom",
                                                        horizontal: "left",
                                                    },
                                                    transformOrigin: {
                                                        vertical: "top",
                                                        horizontal: "left",
                                                    },
                                                    getContentAnchorEl: null,
                                                }}
                                                onChange={(e) => {
                                                    const fallBool = (e.target.value as string) === "Fall";
                                                    setIsFall(fallBool);

                                                    if (fallBool) {
                                                        setStartDate(
                                                            startDate
                                                                .clone()
                                                                .set({ ...fallStart, year: startDate.year() })
                                                        );
                                                        setEndDate(
                                                            endDate.clone().set({ ...fallEnd, year: endDate.year() })
                                                        );
                                                    } else {
                                                        // spring
                                                        setStartDate(
                                                            startDate
                                                                .clone()
                                                                .set({ ...springStart, year: startDate.year() })
                                                        );
                                                        setEndDate(
                                                            endDate.clone().set({ ...springEnd, year: endDate.year() })
                                                        );
                                                    }
                                                }}
                                            >
                                                <MenuItem value={"Fall"}>Fall</MenuItem>
                                                <MenuItem value={"Spring"}>Spring</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            ) : (
                                <p>Date picker</p>
                                // placeholder until material-ui is upgraded from v4 to v5
                            )}

                            <div className="select-analytics">
                                <p>Select analytics to include</p>

                                <Grid container>
                                    <Grid item xs={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={includeName}
                                                    onChange={() => setIncludeName(!includeName)}
                                                    className="checkbox"
                                                />
                                            }
                                            label="Name"
                                            className="checkboxFormLabel"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={includeQuestion}
                                                    onChange={() => setIncludeQuestion(!includeQuestion)}
                                                    className="checkbox"
                                                />
                                            }
                                            label="Question"
                                            className="checkboxFormLabel"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={includeNetID}
                                                    onChange={() => setIncludeNetID(!includeNetID)}
                                                    className="checkbox"
                                                />
                                            }
                                            label="NetID"
                                            className="checkboxFormLabel"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={includeWaitTime}
                                                    onChange={() => setIncludeWaitTime(!includeWaitTime)}
                                                    className="checkbox"
                                                />
                                            }
                                            label="Wait Time"
                                            className="checkboxFormLabel"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={includeTimestamp}
                                                    onChange={() => setIncludeTimestamp(!includeTimestamp)}
                                                    className="checkbox"
                                                />
                                            }
                                            label="Timestamp"
                                            className="checkboxFormLabel"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={includeRating}
                                                    onChange={() => setIncludeRating(!includeRating)}
                                                    className="checkbox"
                                                />
                                            }
                                            label="Rating"
                                            className="checkboxFormLabel"
                                        />
                                    </Grid>
                                </Grid>
                            </div>

                            <button onClick={handleExportCSV} type="button">
                                <div className="export-button-container">
                                    <img src={ExportIcon2} className="export-icon2" alt="Export" />
                                    <p>Export as CSV</p>
                                </div>
                            </button>
                        </Form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportCSVModal;
