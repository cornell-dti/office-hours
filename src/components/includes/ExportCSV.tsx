import React, { useEffect } from "react";
import { useState } from "react";
import { Checkbox, Form, Icon } from "semantic-ui-react";
import CloseIcon from "../../media/CloseIcon.svg";
import ExportIcon from "../../media/ExportIcon.svg";
import ExportIcon2 from "../../media/ExportIcon2.svg";
import { FormControl, FormLabel, Grid, MenuItem, Select } from "@material-ui/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useCourseUsersMap, useCoursesBetweenDates } from "../../firehooks";
import { use } from "chai";
import { set } from "lodash";

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
    const [showSemPicker, setShowSemPicker] = useState<boolean>(true); // true for semester, false for date
    const [isFall, setIsFall] = useState<boolean>(true); // true for fall, false for spring

    const yearArray = Array.from({ length: new Date().getFullYear() - 2017 + 1 }, (value, index) => 2017 + index);
    const [startDate, setStartDate] = useState<moment.Moment>(
        moment(new Date()).set({ month: 7, date: 2, year: moment(new Date()).year() })
    );
    const [endDate, setEndDate] = useState<moment.Moment>(
        moment(new Date()).set({ month: 11, date: 25, year: moment(new Date()).year() })
    );

    const { sessions, questions } = useCoursesBetweenDates(startDate, endDate, courseId);

    const courseUsers = useCourseUsersMap(courseId, true);

    const [sessionData, setSessionData] = useState<sessionRowData[]>([]);

    useEffect(() => {
        console.log("START", startDate.toLocaleString(), "END", endDate.toLocaleString());
    }, [startDate, endDate]);

    const generateSessionData = () => {
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
                                    <Checkbox
                                        radio
                                        label="Semester"
                                        className="radioCheckbox"
                                        value="Semester"
                                        checked={showSemPicker}
                                        onChange={() => setShowSemPicker(true)}
                                    />
                                    <Checkbox
                                        radio
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
                                                                .set({ month: 7, date: 2, year: startDate.year() })
                                                        );
                                                        setEndDate(
                                                            endDate
                                                                .clone()
                                                                .set({ month: 11, date: 25, year: endDate.year() })
                                                        );
                                                    } else {
                                                        // spring
                                                        setStartDate(
                                                            startDate
                                                                .clone()
                                                                .set({ month: 0, date: 2, year: startDate.year() })
                                                        );
                                                        setEndDate(
                                                            endDate
                                                                .clone()
                                                                .set({ month: 4, date: 25, year: endDate.year() })
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
                                // {
                                /* <div className="select-date">
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
                        </div> */
                                // }
                            )}

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
                        </Form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportCSVModal;
