import * as React from "react";
import { useEffect } from "react";
import "../../styles/ta/TAStudentTrends.scss";
import { Dropdown } from 'semantic-ui-react';


const TAStudentTrends = () => {

    const timeOptions = ["Today", "This week", "This month", "This semester"];
    const timeOptionsArray = timeOptions.map(( label: string ) =>
        ({ key: label, text: label, value: label })
    );
    const tasks = ["Assignment 1", "Assignment 2", "All Tasks"];
    const tasksArray = tasks.map((label: string) => ({key: label, text: label, value: label }));
    const filter = ["First Mentioned", "Query Volume"];
    const filtersArray = filter.map((label: string) => ({key: label, text: label, value: label}));
    
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log(tasksArray)
        // eslint-disable-next-line no-console
        console.log(filtersArray)
    });

    return (
        <div className="trends-container">
            <h2 className="trends-header">Student Query Trends</h2>
            <div className="dropdowns-container">
                <div className="time-task-dropdown-container">
                    <Dropdown
                        style={{ marginRight: 16}}
                        fluid={true}
                        selection={true}
                        options={timeOptionsArray}
                        defaultValue={timeOptionsArray[1].value}
                    />
                    <Dropdown
                        style={{ width: 103, marginRight: 0 }}
                        fluid={true}
                        selection={true}
                        options={tasksArray}
                        defaultValue={tasksArray[tasksArray.length - 2].value}
                    />
                </div>
                <div className="filter-dropdown-container">
                    <div className="sort-text-container">
                        <p className="sort-text">Sort by</p>
                    </div>
                    <Dropdown
                        style={{ marginRight: 0 }}
                        fluid={true}
                        selection={true}
                        options={filtersArray}
                        defaultValue={filtersArray[1].value}
                    />
                </div>
            </div>
            <div className="table-header-container">
                <p>TRENDS</p>
                <div className="table-header-sub">
                    <p>QUERY VOLUME</p>
                    <p>FIRST MENTIONED</p>
                </div>
            </div>
            <hr/>
        </div>
    );
};

export default TAStudentTrends;
