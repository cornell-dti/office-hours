"use strict";
exports.__esModule = true;
exports.sendEmailInvite = void 0;
var mailtrap_1 = require("mailtrap");
exports.sendEmailInvite = function () {
    var client = new mailtrap_1.MailtrapClient({ token: process.env.MAILTRAP_TOKEN });
    var sender = {
        email: "mailtrap@queueme.in",
        name: "QueueMeIn Team"
    };
    var recipient = [{
            email: "rg779@cornell.edu"
        }];
    client.send({
        from: sender,
        to: recipient,
        subject: "You've been invited to QueueMeIn!",
        text: "You've been invited to QueueMeIn! Click here to sign up: https://queueme.in",
        category: "QMI Invite – Test"
    });
};
