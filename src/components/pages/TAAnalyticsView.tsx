import * as React from "react";
import { RouteComponentProps } from "react-router";
import { useCourse } from '../../firehooks';
import TopBar from '../includes/TopBar';
import TASidebar from '../includes/TASidebar';
import StudentReviewPanel from "../includes/StudentReviewPanel";
import TAMetrics from "../includes/TAMetrics";

const TAAnalyticsView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const course = useCourse(courseId);

    return (
        <div className="TAAnalyticsView">
            <TASidebar
                courseId={courseId}
                code={course ? course.code : 'Loading'}
                selected={'analytics'}
            />
            <TopBar
                courseId={courseId}
                context="ta"
                role="ta"
            />    
            <section className="rightOfSidebar">
                <div className="main">
                    {/* TODO */}
                    <TAMetrics />
                    <StudentReviewPanel />
                </div>
            </section>
        </div>
    );
};

export default TAAnalyticsView;
