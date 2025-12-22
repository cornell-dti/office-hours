import React from "react";
import { Card } from "@material-ui/core";
import emailjs from "@emailjs/browser";
import { rejectPendingCourse, confirmPendingCourse } from "../../firebasefunctions/courses";
import { addDBNotification } from "../../firebasefunctions/notifications";
import { useUser } from "../../firehooks";

import AdminReadOnlyCourseCard from "./AdminReadOnlyCourseCard";

const AdminPendingCourseCard = ({ course, userId }: { readonly course: FireCourse; userId: string | undefined }) => {
    const user = useUser(userId);

    /**
     * This function uses emailjs to send the course request emails with the correct template and template variables.
     * @param user: user to send the email to
     * @param template: string representing end of template id (currently, only valid values for template are 
     * "rejected" or "approved")
     */
    const sendEmail = (user: FireUser, template: string) => {
        emailjs.send(
            "qmi",
            "course_request_" + template,
            {
                course_code: course.code,
                course_sem: course.semester,
                to_name: user.firstName + " " + user.lastName,
                to_email: user.email,
            },
            "Ye5mZ4kjPRBjUdVUB"
        );
    };

    const reject = () => {
        rejectPendingCourse(course.courseId);

        if (user) {
            const notification = {
                title: "Class Request Rejected",
                subtitle: "New Class Rejected",
                message: "Your submission for " + course.code + "’s course creation has been rejected.",
            };
            addDBNotification(user, notification);

            sendEmail(user, "rejected");
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

            sendEmail(user, "approved");
        }
    };

    return (
        <Card className="course">
            <AdminReadOnlyCourseCard course={course} />
            <div>
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
