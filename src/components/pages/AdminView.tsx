import React from 'react';

import { useAllCourses, useCourseProfessorMap, useCourseTAMap } from '../../firehooks';

const AdminCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const professorMap = useCourseProfessorMap(course);
    const taMap = useCourseTAMap(course);

    return (
        <div className="course">
            <div className="course-section">
                <h3>Course ID</h3>
                <div>{course.courseId}</div>
            </div>
            <div className="course-section">
                <h3>Course Name</h3>
                <div>{course.name}</div>
            </div>
            <div className="course-section">
                <h3>Course Code</h3>
                <div>{course.code}</div>
            </div>
            <div className="course-section">
                <h3>Semester</h3>
                <div>{course.semester}</div>
            </div>
            <div className="course-section">
                <h3>Term</h3>
                <div>{course.term}</div>
            </div>
            <div className="course-section">
                <h3>Queue Open Interval</h3>
                <div>{course.queueOpenInterval}</div>
            </div>
            <div className="course-section">
                <h3>Char Limit</h3>
                <div>{course.charLimit}</div>
            </div>
            <div className="course-section">
                <h3>Start Date</h3>
                <div>{course.startDate.toDate().toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>End Date</h3>
                <div>{course.endDate.toDate().toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>Professors</h3>
                <div>
                    {course.professors.map(id => {
                        const professor = professorMap[id];
                        if (professor == null) {
                            return null;
                        }
                        return (
                            <div key={id}>
                                <h4>{professor.firstName} {professor.lastName}</h4>
                                <div>{professor.email}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="course-section">
                <h3>TAs</h3>
                <div>
                    {course.tas.map(id => {
                        const ta = taMap[id];
                        if (ta == null) {
                            return null;
                        }
                        return (
                            <div key={id}>
                                <h4>{ta.firstName} {ta.lastName}</h4>
                                <div>{ta.email}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const AdminView = () => {
    const courses = useAllCourses();

    return (
        <div className="AdminView">
            <h2>Courses</h2>
            {courses.map(course => (
                <AdminCourseCard key={course.courseId} course={course} />
            ))}
        </div>
    );
};

export default AdminView;
