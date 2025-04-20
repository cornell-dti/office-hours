import * as React from "react";
import { useEffect, useState } from "react";
import { Dropdown } from 'semantic-ui-react';
import TAQuery from "./TAQuery";
import { dummyData } from "./dummyData";

// params? for backend fetching maybe?
const TAStudentTrends = () => {
    const timeOptions = ["Today", "This week", "This month", "This semester"];
    const timeOptionsArray = timeOptions.map(( label: string ) =>
        ({ key: label, text: label, value: label })
    );
    const tasks = ["Assignment 1", "Assignment 2", "All Tasks"];
    const tasksArray = tasks.map((label: string) => ({key: label, text: label, value: label }));
    const filter = ["First Mentioned", "Query Volume"];
    const filtersArray = filter.map((label: string) => ({key: label, text: label, value: label}));

    const [timeFilter, setTimeFilter] = useState("This week");
    const [taskFilter, setTaskFilter] = useState(tasks[tasks.length - 2]);
    const [sortFilter, setSortFilter] = useState("Query Volume");
    const [filteredData, setFilteredData] = useState(dummyData);

    useEffect(() => {
        /* TODO: adjust filters after backend implementation to fully match figma. */
        let result = [...dummyData];

        result = result.filter(item => {
            const mention = item.mention.toLowerCase();
            const num = parseInt(mention, 10) || 0;
            
            if (timeFilter === "Today") {
                return mention.includes("day") && num <= 1;
            }
            if (timeFilter === "This week") {
                return (mention.includes("day") && num <= 7) 
            }
            if (timeFilter === "This month") {
                return (mention.includes("day") && num <= 31);
            }
            return true; 
        });
    

        if (taskFilter !== "All Tasks") {
            result = result.filter(item => item.assignment === taskFilter);
        }
        /* TODO: only show query vol amt within a time period */
        result.sort((a, b) => {
            if (sortFilter === "Query Volume") {
                if (b.volume !== a.volume) return b.volume - a.volume;

                const mentionDiff = compareMentionTimes(a.mention, b.mention);
                if (mentionDiff !== 0) return mentionDiff;

                return a.title.localeCompare(b.title);
            }  
            const mentionDiff = compareMentionTimes(a.mention, b.mention);
            if (mentionDiff !== 0 ) return mentionDiff;
            if (b.volume !== a.volume) return b.volume - a.volume;
            return a.title.localeCompare(b.title);
            
        });

        setFilteredData(result);
    }, [timeFilter, taskFilter, sortFilter]);

    const compareMentionTimes = (a: string, b: string) => {
        const getDayValue = (m: string) => {
            m = m.toLowerCase();
            const num = parseInt(m, 10) || 0;
            if (m.includes("day")) return num ;
            if (m.includes("week")) return num * 7;
            if (m.includes("month")) return num * 30;
            return 0;
        };
    
        return getDayValue(a) - getDayValue(b); 
    };

    return (
        <div className="trends-container">
            <h2 className="trends-header">Student Query Trends</h2>
            <div className="dropdowns-container">
                {/* TODO: no scroll bars */}
                <div className="time-task-dropdown-container">
                    <Dropdown
                        style={{ marginRight: 16}}
                        fluid={true}
                        selection={true}
                        options={timeOptionsArray}
                        defaultValue={timeFilter}
                        onChange={(e, { value }) => setTimeFilter(value as string)}
                    />
                    <Dropdown
                        style={{ width: 103, marginRight: 0 }}
                        fluid={true}
                        selection={true}
                        options={tasksArray}
                        defaultValue={taskFilter}
                        onChange={(e, { value }) => setTaskFilter(value as string)}
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
                        defaultValue={sortFilter}
                        onChange={(e, { value }) => setSortFilter(value as string)}
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
            <div className="table-contents-container">
                {filteredData.map((topic) => 
                    <TAQuery
                        title={topic.title}
                        volume={topic.volume}
                        mention={topic.mention}
                        questions={topic.questions}
                    />
                )}
            </div>
            
        </div>
    );
};

export default TAStudentTrends;
