import React, { useState, useEffect } from 'react'
import plusCircle from '../../media/plus-circle.svg';
import chevronUp from '../../media/chevron-up.svg'
import chevronDown from '../../media/chevron-down.svg'
import announcement from '../../media/announcement.svg'

const TaAnnouncements = () => {

  // TODO: Change num, TA name 
  let num = 0
  let taName = "Ashley Ticzon"
  const [showBody, setShowBody] = useState(false)
  const [showAnnouncements, setShowAnnouncements] = useState(false)
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false)
  const [announcementContent, setAnnouncementContent] = useState("")

  const clickCircleIcon = () => {
    setShowBody(true)
    setShowAnnouncements(false);
    setShowNewAnnouncement(true);
  }

  const collapseBody = () => {
    setShowBody(state => !state)
    setShowAnnouncements(true);
  }

  const enterAnnouncement = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnnouncementContent(e.target.value)
  }

  const onClickCancelButton = () => {
    setAnnouncementContent("")
    collapseBody();

  }

  const onClickPostButton = () => {
    alert(announcementContent)
  }

  useEffect(() => {
    if (!showBody) {
      setShowAnnouncements(true);
      setShowNewAnnouncement(false)
    }
  }, [showBody])

  return (
    <div className="AnnouncementContainer">
      <div className="AnnouncementTop">
        <div className="AnnouncementTitle">
          TA announcements ({num})
        </div>
        <div className="AnnouncementIcons">
          <img src={plusCircle} alt="Add New Announcement" onClick={clickCircleIcon} />
          <img src={showBody ? chevronUp : chevronDown} alt="View Announcements" onClick={collapseBody} />
        </div>
      </div>
      {showBody &&
        <div className="AnnouncementBottom">
          {showAnnouncements &&
            <div>
              {num === 0 && <span className="NoAnnouncement">
                No announcements yet. Click on "plus" icon to make one.
              </span>}
            </div>
          }

          {showNewAnnouncement &&
            <div className="NewAnnouncement">
              <div className="NewAnnouncementTop">
                <img src={announcement} alt="Announcements" />
                <div className="NewAnnouncementTaName">{taName} (You)</div>
              </div>
              <div className="NewAnnouncementMiddle">
                <div className="NewAnnouncementInput">
                  <input
                    type="text"
                    placeholder="Enter public announcement to entire queue."
                    value={announcementContent}
                    onChange={enterAnnouncement}
                    maxLength={45} />
                </div>
                <div className="NewAnnouncementLength">
                  {announcementContent.length} / 45
                </div>
              </div>
              <div className="NewAnnouncementBottom">
                <span className="CancelButton" onClick={onClickCancelButton}>
                  Cancel
                </span>
                <span className="PostButton" onClick={onClickPostButton}>
                  Post
                </span>
              </div>
            </div>}
        </div>}

    </div>
  )
}

export default TaAnnouncements