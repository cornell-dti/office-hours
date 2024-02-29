import React, { useEffect } from "react";
import { useState } from "react";
import { Checkbox, Icon } from "semantic-ui-react";
import CloseIcon from "../../media/CloseIcon.svg";
import ExportIcon from "../../media/ExportIcon.svg";
import ExportIcon2 from "../../media/ExportIcon2.svg";
import { FormControl, FormLabel, Grid, MenuItem, Select } from "@material-ui/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useCourseUsersMap, useCoursesBetweenDates } from "../../firehooks";
import { use } from "chai";

type Props = {
    setShowModal: (show: boolean) => void;
    showModal: boolean;
    courseId: string;
};

type sessionRowData = {
    sessionTitle: string;
    sessionTimestamp: string;
    taNames: string;
    taNetIDs: string;
    sessionWaitTime: string; // average wait time
    sessionNumQuestions: string;
    sessionPercentResolved: string;
    // sessionRating: string; add later when rating is implemented/merged
};

const ExportCSVModal = ({ setShowModal, showModal, courseId }: Props) => {
    const yearArray = Array.from({ length: new Date().getFullYear() - 2017 + 1 }, (value, index) => 2017 + index);
    const [startDate, setStartDate] = useState<moment.Moment>(moment().subtract(1, "days"));
    const [endDate, setEndDate] = useState<moment.Moment>(moment());

    const { sessions, questions } = useCoursesBetweenDates(startDate, endDate, courseId);

    const courseUsers = useCourseUsersMap(courseId, true);

    const [sessionData, setSessionData] = useState<sessionRowData[]>([]);

    useEffect(() => {
        const tempSessionData: sessionRowData[] = [];
        sessions.forEach((session) => {
            const sessionTitle = session.title ?? "No Title";
            const sessionTimestamp =
                session.startTime.toDate().toLocaleString() + " - " + session.endTime.toDate().toLocaleString();
            const taNames = session.tas
                .map((userId) => {
                    const courseUser = courseUsers[userId];
                    if (courseUser === undefined) {
                        return "unknown";
                    }
                    return `${courseUser.firstName} ${courseUser.lastName}`;
                })
                .join(", ");
            const taNetIDs = session.tas
                .map((userId) => {
                    const courseUser = courseUsers[userId];
                    if (courseUser === undefined) {
                        return "unknown";
                    }
                    return courseUser.email.search("@") !== -1 ? courseUser.email.split("@")[0] : courseUser.email;
                })
                .join(", ");
            const sessionWaitTime = "" + session.totalWaitTime / session.totalQuestions;
            const sessionNumQuestions = session.totalQuestions.toString();
            const sessionPercentResolved = "" + (session.resolvedQuestions / session.totalQuestions) * 100 + "%";
            tempSessionData.push({
                sessionTitle: sessionTitle,
                sessionTimestamp: sessionTimestamp,
                taNames: taNames,
                taNetIDs: taNetIDs,
                sessionWaitTime: sessionWaitTime,
                sessionNumQuestions: sessionNumQuestions.toString(),
                sessionPercentResolved: sessionPercentResolved,
            });
        });
        console.log(tempSessionData);
        setSessionData(tempSessionData);
    }, [sessions]);

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

                        <div className="time-interval">
                            <p>Select time interval by</p>

                            <div className="row">
                                <Checkbox
                                    radio
                                    label="Semester"
                                    className="radioCheckbox"
                                    value="Semester"
                                    // checked={value === 'this'}
                                    // onChange={(e, data) => setValue(data.value)}
                                />
                                <Checkbox
                                    radio
                                    label="Date"
                                    className="radioCheckbox"
                                    value="this"
                                    // checked={value === 'this'}
                                    // onChange={(e, data) => setValue(data.value)}
                                />
                            </div>
                        </div>

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
                                        value={2024}
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
                                        // onChange={() => console.log("change"}
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
                                        value={"Fall"}
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
                                        // onChange={() => console.log("change"}
                                    >
                                        <MenuItem value={"Fall"}>Fall</MenuItem>
                                        <MenuItem value={"Spring"}>Spring</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        {/* <div className="select-date">
                            <div className="datePicker">
                                <DatePicker
                                    selected={startTime}
                                    onChange={() => console.log("bruh")}
                                    dateFormat="MM/DD/YY"
                                    minDate={moment()}
                                    placeholderText={moment().format("MM/DD/YY")}
                                    readOnly={true}
                                />
                            </div>
                        </div> */}

                        <div className="select-analytics">
                            <p>Select analytics to include</p>

                            <Grid container>
                                <Grid item xs={6}>
                                    <Checkbox label="Name" className="checkbox" value="this"></Checkbox>
                                </Grid>
                                <Grid item xs={6}>
                                    <Checkbox label="Question" className="checkbox" value="this"></Checkbox>
                                </Grid>
                                <Grid item xs={6}>
                                    <Checkbox label="NetID" className="checkbox" value="this"></Checkbox>
                                </Grid>
                                <Grid item xs={6}>
                                    <Checkbox label="Wait Time" className="checkbox" value="this"></Checkbox>
                                </Grid>
                                <Grid item xs={6}>
                                    <Checkbox label="Timestamp" className="checkbox" value="this"></Checkbox>
                                </Grid>
                                <Grid item xs={6}>
                                    <Checkbox label="Rating" className="checkbox" value="this"></Checkbox>
                                </Grid>
                            </Grid>
                        </div>

                        <button onClick={() => setShowModal(false)} type="button">
                            <div className="export-button-container">
                                <img src={ExportIcon2} className="export-icon2" alt="Export" />
                                <p>Export as CSV</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportCSVModal;
