import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { Dropdown } from 'semantic-ui-react';
import TAQuery from "./TAQuery";
import { getStudentTrends } from "../../firebasefunctions/taPrep";


type TAStudentTrendsProps = {
    courseId: string;
}

const TAStudentTrends = ({ courseId }: TAStudentTrendsProps) => {  
    const [filteredData, setFilteredData] = useState<TrendData[]>([]);

    const[allTrends, setAllTrends] = useState<TrendData[]>([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState<string | null>(null);

    const tasks = React.useMemo(() => {
        const uniqueTasks = Array.from(new Set(allTrends.map(t => t.assignment)));
        return ["All Tasks", ...uniqueTasks.sort()];
    }, [allTrends]);
    const tasksArray = tasks.map((label: string) => ({key: label, text: label, value: label }));
    
    const timeOptions = ["Today", "This week", "This month", "This semester"];
    const timeOptionsArray = timeOptions.map(( label: string ) =>
        ({ key: label, text: label, value: label })
    );

    const filter = ["First Mentioned", "Query Volume"];
    const filtersArray = filter.map((label: string) => ({key: label, text: label, value: label}));

    // useStates to track filter selection
    const [timeFilter, setTimeFilter] = useState("This week");
    const [taskFilter, setTaskFilter] = useState("All Tasks");
    const [sortFilter, setSortFilter] = useState("Query Volume");

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setLoading(true);
                const trends = await getStudentTrends(courseId);
                setAllTrends(trends);
                setError(null);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Error fetching trends:", err);
                setError("Failed to load trends data");
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [courseId]);

    const getFilteredData = useCallback(() => {
        let result = [...allTrends];

        // logic for the time dropdown filter
        result = result.filter(item => {
            const now = new Date();
            const mentionDate = item.firstMentioned;
            const diffMs = now.getTime() - mentionDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (timeFilter === "Today") {
                return diffDays === 0;
            }
            if (timeFilter === "This week") {
                return diffDays <= 7; 
            }
            if (timeFilter === "This month") {
                return diffDays <= 31;
            }
            return true; 
        });
    

        // logic for the task dropdown filter 
        if (taskFilter !== "All Tasks") {
            result = result.filter(item => item.assignment === taskFilter);
        }

        /* TODO: only show query vol amt within a time period */
        // logic for the sort by filter
        result.sort((a, b) => {
            if (sortFilter === "Query Volume") {
                if (b.volume !== a.volume) return b.volume - a.volume;

                const dateDiff = a.firstMentioned.getTime() - b.firstMentioned.getTime();
                if (dateDiff !== 0) return dateDiff;

                return a.title.localeCompare(b.title);
            }  
            const dateDiff = b.firstMentioned.getTime() - a.firstMentioned.getTime();
            if (dateDiff !== 0 ) return dateDiff;
            if (b.volume !== a.volume) return b.volume - a.volume;
            return a.title.localeCompare(b.title);
            
        });

        return result;
    }, [allTrends, timeFilter, taskFilter, sortFilter])

    useEffect(() => {
        setFilteredData(getFilteredData);
    }, [getFilteredData]);

    if (loading) {
        return (
            <div className="trends-container">
                <h2 className="trends-header">Student Query Trends</h2>
                <p>Loading trends...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="trends-container">
                <h2 className="trends-header">Student Query Trends</h2>
                <p style={{color: 'red'}}>{error}</p>
            </div>
        );
    }

    return (
        <div className="trends-container">
            <h2 className="trends-header">Student Query Trends</h2>
            <p className="trends-note"> Trends are updated on a weekly basis. </p>
            <div className="dropdowns-container">
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
                {filteredData.length === 0 ? (
                    <p style={{ padding: '20px', textAlign: 'center' }}>
                        No trends found for the selected filters
                    </p>
                ) : (
                    filteredData.map((topic) => (
                        <TAQuery
                            key={`${topic.title}-${topic.assignment}`}
                            title={topic.title}
                            volume={topic.volume}
                            mention={topic.mention}
                            questions={topic.questions}
                        />
                    ))
                )
                }
            </div>
            
        </div>
    );
};

export default TAStudentTrends;