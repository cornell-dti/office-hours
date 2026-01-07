import React from "react";
import { Card } from "@material-ui/core";
//import emailjs from "@emailjs/browser";
//import { Resend } from 'resend';
import { rejectPendingCourse, confirmPendingCourse } from "../../firebasefunctions/courses";
import { addDBNotification } from "../../firebasefunctions/notifications";
import { useUser } from "../../firehooks";
//import 'dotenv/config'

const AdminPendingCourseCard = ({ course, userId }: { readonly course: FireCourse; userId: string | undefined }) => {
    const user = useUser(userId);

    /**
     * This function uses emailjs to send the course request emails with the correct template and template variables.
     * @param user: user to send the email to
     * @param template: string representing end of template id (currently, only valid values for template are 
     * "rejected" or "approved")
     */
    const sendEmail = (user: FireUser, template: string) => {
        //         const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);
        //         const subject = template === "approved" ? `Queue Me In ${course.code} ${course.semester} Approved`: `Queue Me In ${course.code} ${course.semester} Rejected`
        //         /* eslint-disable max-len */
        //         const message =`Hello ${user.firstName + " " + user.lastName},
        // ${template === "approved" ? 
        //     "Your new class request on QMI has been approved. " + course.code + " has been added to the current classes for " +course.semester + ".":
        //     "Your new class request on QMI has been rejected. "+ course.code + " for " + course.semester + " has been removed from the pending classes. Please email QMI directly for more info."}

        // Best wishes,
        // QMI`

        //   resend.emails.send({
        //     from: 'queuemein@cornelldti.org',
        //     to: [user.email],
        //     subject: subject,
        //     html: message,
        //   });

        // emailjs.send(
        //     "qmi",
        //     "course_request_" + template,
        //     {
        //         course_code: course.code,
        //         course_sem: course.semester,
        //         to_name: user.firstName + " " + user.lastName,
        //         to_email: user.email,
        //     },
        //     "Ye5mZ4kjPRBjUdVUB"
        // );
    };

    const reject = () => {
        if (user) {
            rejectPendingCourse(course, user);
            const notification = {
                title: "Class Request Rejected",
                subtitle: "New Class Rejected",
                message: "Your submission for " + course.code + "’s course creation has been rejected.",
            };
            addDBNotification(user, notification);
        }
    };

    const confirm = () => {
        if (user) {
            confirmPendingCourse(course, user);
            const notification = {
                title: "Class Request Approved",
                subtitle: "New Class Approved",
                message: "Your submission for " +course.code+ 
                "’s course creation has been approved and the course is now live.",
            };
            addDBNotification(user, notification);
        }
    };

    return (
        <Card className="course">            
            <div className="courseInfo">
                <div className="courseInfoRow">
                    <div className="field">
                        Creator
                    </div>
                    <div className="value">
                        <p>Professor {user?.firstName} {user?.lastName}</p>
                        <div className="grayText">{user?.email}</div>
                    </div>
                </div>

                <div className="courseInfoRow">
                    <div className="field">
                        Course
                    </div>
                    <div className="value">
                        <p>{course.code.trim()}</p>
                        <p>{course.name.trim()}</p>
                    </div>
                </div>

                <div className="courseInfoRow">
                    <div className="field">
                        Semester
                    </div>
                    <div className="value">
                        <p>{course.semester}</p>
                    </div>
                </div>

                <div className="courseInfoRow">
                    <div className="field">
                        Settings
                    </div>
                    <div className="value">
                        <div className="grayText">Queue Open Interval: <span>{course.queueOpenInterval}</span></div>
                        <div className="grayText">Char Limit: <span>{course.charLimit}</span></div>
                        <div className="grayText">Start Date: <span>{course.startDate
                            .toDate().toLocaleDateString()}</span></div>
                        <div className="grayText">End Date: <span>{course.endDate.toDate().
                        toLocaleDateString()}</span></div>
                    </div>
                </div>
            </div>
            <div className="buttonRow">
                <button type="button" className="pending-button reject" onClick={reject}>
                    Reject
                </button>
                <button type="button" className="pending-button confirm" onClick={confirm}>
                    Confirm
                </button>
            </div>
        </Card>
    );
};

export default AdminPendingCourseCard;
