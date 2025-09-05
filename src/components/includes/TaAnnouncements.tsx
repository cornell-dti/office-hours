import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Timestamp } from "../../firebase"
import plusCircle from "../../media/plus-circle.svg";
import chevronUp from "../../media/chevron-up.svg";
import chevronDown from "../../media/chevron-down.svg";
import announcementImg from "../../media/announcement.svg";
import { addTaAnnouncement, deleteTaAnnouncement } from "../../firebasefunctions/session";
import { RootState } from "../../redux/store";

type Props = {
    user: FireUser;
    session: FireSession;
    showProfessorStudentView: boolean;
};

const TaAnnouncements = ({ user, session, showProfessorStudentView }: Props) => {
    const [showBody, setShowBody] = useState(false);
    const [showAnnouncements, setShowAnnouncements] = useState(false);
    const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
    const [announcementContent, setAnnouncementContent] = useState("");
    const [taAnnouncements, setTaAnnouncements] = useState(session.taAnnouncements);

    const clickCircleIcon = () => {
        setShowBody(true);
        setShowAnnouncements(false);
        setShowNewAnnouncement(true);
    };

    const collapseBody = () => {
        if (!showBody) {
            setShowAnnouncements(true);
            setShowNewAnnouncement(false);
        }
        setShowBody((state) => !state);
        setShowAnnouncements(true);
    };

    const enterAnnouncement = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnnouncementContent(e.target.value);
    };

    const onClickCancelButton = () => {
        setAnnouncementContent("");
        collapseBody();
    };

    const onClickPostButton = () => {
        addTaAnnouncement(session, user, announcementContent);
        setAnnouncementContent("");
        setShowNewAnnouncement(false);
        setShowAnnouncements(true);
    };

    const deleteAnnouncement = (announcement: string, uploadTime: FireTimestamp) => {
        deleteTaAnnouncement(session, user, announcement, uploadTime);
    };

    const getTimeDifference = (announcement: TaAnnouncement) => {
        const announcementTime = announcement.uploadTime.toDate().getTime();
        const currentTime = Timestamp.now().toDate().getTime();
        const difference = currentTime - announcementTime;
        const minutes = Math.round(difference / 60000);
        return [Math.floor(minutes / 60), minutes % 60];
    };

    useEffect(() => {
        setTaAnnouncements(session.taAnnouncements);
    }, [session]);

    return (
        <div className="AnnouncementContainer">
            <div className="AnnouncementTop">
                <div className="AnnouncementTitle">
                    TA announcements ({!taAnnouncements ? 0 : taAnnouncements.length})
                </div>
                <div className="AnnouncementIcons">
                    {!showProfessorStudentView &&
                        (user.roles[session.courseId] === "professor" || user.roles[session.courseId] === "ta") && (
                        <img src={plusCircle} alt="Add New Announcement" onClick={clickCircleIcon} />
                    )}
                    <img src={showBody ? chevronUp : chevronDown} alt="View Announcements" onClick={collapseBody} />
                </div>
            </div>
            {showBody && (
                <div className="AnnouncementBottom">
                    {showAnnouncements && (
                        <div>
                            {(!taAnnouncements|| taAnnouncements?.length === 0) && (
                                <span className="NoAnnouncement">No announcements yet.</span>
                            )}
                            {taAnnouncements && (
                                <span>
                                    {taAnnouncements?.map((a, i) => (
                                        <div className="Announcement" key={i}>
                                            <div className="AnnouncementHeading">
                                                <div>
                                                    <img
                                                        alt="Announcement Icon"
                                                        src={announcementImg}
                                                        className="AnnouncementIcon"
                                                    />
                                                    <img
                                                        src={user ? user.photoUrl : "/placeholder.png"}
                                                        alt="Profile"
                                                        className="AnnouncementTaPhoto"
                                                    />
                                                    {a.ta.firstName}
                                                    {a.ta.lastName}
                                                    {a.ta.userId === user.userId && "(You)"}
                                                </div>
                                                <div>
                                                    {getTimeDifference(a)[0] !== 0 && getTimeDifference(a)[0] + ` hour`}
                                                    {getTimeDifference(a)[1]} min ago
                                                </div>
                                            </div>
                                            <div className="AnnouncementContent">
                                                {a.announcement}
                                                {a.ta.userId === user.userId && (
                                                    <span
                                                        onClick={() => {
                                                            deleteAnnouncement(a.announcement, a.uploadTime)
                                                        }}
                                                    >
                                                        DELETE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </span>
                            )}
                        </div>
                    )}

                    {showNewAnnouncement && (
                        <div className="NewAnnouncement">
                            <div className="NewAnnouncementTop">
                                <img src={announcementImg} alt="Announcements" />
                                <div className="NewAnnouncementTaName">
                                    {`${user.firstName} ${user.lastName}`} (You)
                                </div>
                            </div>
                            <div className="NewAnnouncementMiddle">
                                <div className="NewAnnouncementInput">
                                    <input
                                        type="text"
                                        placeholder="Enter public announcement to entire queue."
                                        value={announcementContent}
                                        onChange={enterAnnouncement}
                                        maxLength={45}
                                    />
                                </div>
                                <div className="NewAnnouncementLength">{announcementContent.length} / 45</div>
                            </div>
                            <div className="NewAnnouncementBottom">
                                <span className="CancelButton" onClick={onClickCancelButton}>
                                    Cancel
                                </span>
                                <span className="PostButton" onClick={onClickPostButton}>
                                    Post
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
    session: state.course.session,
});

export default connect(
    mapStateToProps,
    {}
)((props: Props) => {
    return <TaAnnouncements {...props} />;
});
