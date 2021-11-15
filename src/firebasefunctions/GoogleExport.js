const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
    '712983537068-qmi5nbgq57putl8n4hl008v38gifrqf5.apps.googleusercontent.com',
    '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'
);

oAuth2Client.setCredentials({
    refresh_token:
        '1//04WH85AW0o7NyCgYIARAAGAQSNwF-L9IrDYhJRRFKvpn541mOT0x--YdmukVISm6bPOyGbeI1vHlM5jDkXxQ1RBC_hvCQXEuETmc',
});

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

export const createNewEvent = () => {
    const eventStartTime = new Date();
    // eventStartTime.setDate(4)
    eventStartTime.setDate(eventStartTime.getDay() + 2);

    const eventEndTime = new Date();
    eventEndTime.setDate(eventEndTime.getDay() + 2);
    eventEndTime.setMinutes(eventEndTime.getMinutes() + 45);

    const event = {
        summary: 'Meet with David',
        location: '106 Valentine Pl, Ithaca, NY 14850',
        description:
            'Meeting with David to talk about the new client project and how to add the google calendar api.',
        start: {
            dateTime: eventStartTime,
            timeZone: 'America/Denver',
        },
        end: {
            dateTime: eventEndTime,
            timeZone: 'America/Denver',
        },
    };

    calendar.freebusy.query(
        {
            resource: {
                timeMin: eventStartTime,
                timeMax: eventEndTime,
                timeZone: 'America/Denver',
                items: [{ id: 'primary' }],
            },
        },
        (err, res) => {
            if (err) return console.error('Free busy query error: ', err);
            const eventsArr = res.data.calendars.primary.busy;
            if (eventsArr.length === 0)
                return calendar.events.insert(
                    { calendarId: 'primary', resource: event },
                    (err) => {
                        if (err)
                            return console.error(
                                'Calendar event creation error: ',
                                err
                            );
                        return console.log('calendar event created');
                    }
                );
            return console.log("Sorry I'm busy");
        }
    );
};
