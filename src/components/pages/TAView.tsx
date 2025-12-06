/* eslint-disable no-console */
import React from 'react';
import { RouteComponentProps } from 'react-router';
// import { DropdownItemProps } from 'semantic-ui-react';
// import { of, combineLatest, Observable } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
// import { docData } from 'rxfire/firestore';
import TopBar from '../includes/TopBar';
import TASidebar from '../includes/TASidebar';
import TAStudentTrends from "../includes/TAStudentTrends";
import TAResources from "../includes/TAResources";

import { useCourse } from '../../firehooks';
// import { firestore } from '../../firebase';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

const TAView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const week = new Date();
    week.setHours(0, 0, 0, 0);
    const daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
    week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const course = useCourse(courseId);

    return (
        <div className="TAView">
            <TASidebar
                courseId={courseId}
                code={course ? course.code : 'Loading'}
                selected={'prep'}
            />
            <TopBar
                courseId={courseId}
                context="ta"
                role="ta"
            />
            <section className="rightOfSidebar">
                <div className="main">
                    <TAStudentTrends courseId={courseId}/>
                    <TAResources />
                </div>
            </section>
        </div>
    );
};

export default TAView;
