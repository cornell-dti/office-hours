"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var firebase_admin_1 = require("firebase-admin");
firebase_admin_1["default"].initializeApp({
    credential: firebase_admin_1["default"].credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'
});
// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');
// Initialize Firestore
var db = firebase_admin_1["default"].firestore();
var errorUsers = [];
// Firestore Timestamps for the query range
var startDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2024-01-22'));
var endDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2024-11-22'));
var getWrapped = function () { return __awaiter(void 0, void 0, void 0, function () {
    var questionsRef, sessionsRef, wrappedRef, usersRef, questionsSnapshot, userStats, getWrappedUserDocs, taCounts, monthTimeCounts, officeHourSessions, TAsessions, updateWrappedDocs, initializeUser, _loop_1, _i, _a, doc, _loop_2, _b, _c, _d, userId, stats;
    var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __generator(this, function (_q) {
        switch (_q.label) {
            case 0:
                questionsRef = db.collection('questions-test');
                sessionsRef = db.collection('sessions-test');
                wrappedRef = db.collection('wrapped-fa24');
                usersRef = db.collection('users-test');
                return [4 /*yield*/, questionsRef
                        .where('timeEntered', '>=', startDate)
                        .where('timeEntered', '<=', endDate)
                        .get()];
            case 1:
                questionsSnapshot = _q.sent();
                userStats = {};
                getWrappedUserDocs = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var docs;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                docs = {};
                                return [4 /*yield*/, Promise.all(Object.keys(userStats).map(function (id) { return __awaiter(void 0, void 0, void 0, function () {
                                        var _a, _b;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    if (!id) return [3 /*break*/, 2];
                                                    _a = docs;
                                                    _b = id;
                                                    return [4 /*yield*/, usersRef.doc(id).get()];
                                                case 1:
                                                    _a[_b] = _c.sent();
                                                    _c.label = 2;
                                                case 2: return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, docs];
                        }
                    });
                }); };
                taCounts = {};
                monthTimeCounts = {};
                officeHourSessions = {};
                TAsessions = {};
                updateWrappedDocs = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var batch, userDocuments, _i, _a, _b, userId, stats, hasVisits, isUserActive, hasFavoriteTa, taStatsMismatched, wrappedDocRef, userDoc;
                    var _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                batch = db.batch();
                                return [4 /*yield*/, getWrappedUserDocs()];
                            case 1:
                                userDocuments = _d.sent();
                                for (_i = 0, _a = Object.entries(userStats); _i < _a.length; _i++) {
                                    _b = _a[_i], userId = _b[0], stats = _b[1];
                                    // Only want to make wrapped changes for a user if they have an ID and are active 
                                    if (userId) {
                                        hasVisits = stats.numVisits > 0;
                                        isUserActive = stats.timeHelpingStudents === undefined || (((_c = TAsessions[userId]) === null || _c === void 0 ? void 0 : _c.length) > 0);
                                        hasFavoriteTa = stats.favTaId !== "";
                                        taStatsMismatched = (stats.timeHelpingStudents !== undefined && stats.numStudentsHelped === undefined)
                                            || (stats.timeHelpingStudents === undefined && stats.numStudentsHelped !== undefined);
                                        if (hasVisits && isUserActive && hasFavoriteTa) {
                                            if (!(stats.favClass && stats.favDay !== -1 && stats.favMonth !== -1)) {
                                                errorUsers.push({ user: userId, error: "User is active and has favorite TA but missing one of the following:\n                             favClass: " + stats.favClass + ", favDay: " + stats.favDay + ", favMonth: " + stats.favMonth });
                                            }
                                            else if (taStatsMismatched) {
                                                errorUsers.push({ user: userId, error: "Mismatch in updating ta specfic values." });
                                            }
                                            else {
                                                wrappedDocRef = wrappedRef.doc(userId);
                                                batch.set(wrappedDocRef, stats);
                                                userDoc = userDocuments[userId];
                                                if (userDoc.exists) {
                                                    usersRef.doc(userId).update({
                                                        wrapped: true
                                                    });
                                                }
                                                else {
                                                    // Handle the case where the document does not exist
                                                    errorUsers.push({ user: userId, error: "No document found for this user, skipping update." });
                                                }
                                            }
                                        }
                                        else {
                                            errorUsers.push({ user: userId, error: "User is not an active student/TA or doesn't have favorite TA." });
                                        }
                                    }
                                    else {
                                        errorUsers.push({ user: userId, error: "User ID is undefined, skipping update." });
                                    }
                                }
                                return [4 /*yield*/, batch.commit()];
                            case 2:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                initializeUser = function (answererId, askerId) {
                    var _a;
                    // if an instance doesn't exist yet for the user, creating one
                    if (!userStats[askerId]) {
                        userStats[askerId] = {
                            numVisits: 0,
                            favClass: '',
                            favTaId: '',
                            favMonth: -1,
                            favDay: -1,
                            totalMinutes: 0,
                            personalityType: ''
                        };
                        taCounts[askerId] = new Map();
                        officeHourSessions[askerId] = [];
                        monthTimeCounts[askerId] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    }
                    if (!userStats[answererId]) {
                        userStats[answererId] = {
                            numVisits: 0,
                            favClass: '',
                            favTaId: '',
                            favMonth: -1,
                            favDay: -1,
                            totalMinutes: 0,
                            personalityType: '',
                            timeHelpingStudents: 0,
                            numStudentsHelped: 0
                        };
                        taCounts[answererId] = new Map();
                        officeHourSessions[answererId] = [];
                        TAsessions[answererId] = [];
                        monthTimeCounts[answererId] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        // Checking if ta already showed up as student and now as an answerer
                    }
                    else if (userStats[answererId] && ((_a = userStats[answererId]) === null || _a === void 0 ? void 0 : _a.timeHelpingStudents) === undefined) {
                        userStats[answererId] = {
                            numVisits: userStats[answererId].numVisits,
                            favClass: userStats[answererId].favClass,
                            favTaId: userStats[answererId].favTaId,
                            favMonth: userStats[answererId].favMonth,
                            favDay: userStats[answererId].favDay,
                            totalMinutes: userStats[answererId].totalMinutes,
                            personalityType: userStats[answererId].personalityType,
                            timeHelpingStudents: 0,
                            numStudentsHelped: 0
                        };
                        TAsessions[answererId] = [];
                    }
                };
                _loop_1 = function (doc) {
                    var question, answererId, askerId, sessionId, timeEntered, timeAddressed, sessionDoc, timeHelping, taAmt, minutesSpent;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                question = doc.data();
                                answererId = question.answererId, askerId = question.askerId, sessionId = question.sessionId, timeEntered = question.timeEntered, timeAddressed = question.timeAddressed;
                                initializeUser(answererId, askerId);
                                return [4 /*yield*/, sessionsRef.doc(sessionId).get()];
                            case 1:
                                sessionDoc = _a.sent();
                                if (TAsessions[answererId].find(function (TAsession) { return TAsession.session === sessionId; }) === undefined) {
                                    /* Since TA was active during this session and this is the first
                                    time encountering the session, we add it to their timeHelped */
                                    if (sessionDoc.exists && userStats[answererId].timeHelpingStudents !== undefined) {
                                        timeHelping = (sessionDoc.get('endTime').toDate().getTime()
                                            - sessionDoc.get('startTime').toDate().getTime()) / 60000;
                                        // this should never be less than 0 (or 0, really)
                                        if (timeHelping >= 0) {
                                            userStats[answererId].timeHelpingStudents =
                                                ((_e = userStats[answererId].timeHelpingStudents) !== null && _e !== void 0 ? _e : 0) + timeHelping;
                                        }
                                    }
                                }
                                officeHourSessions[askerId] = officeHourSessions[askerId] || [];
                                if (!officeHourSessions[askerId].includes(sessionId)) {
                                    officeHourSessions[askerId].push(sessionId);
                                }
                                if (answererId && timeAddressed) {
                                    (_f = TAsessions[answererId]) === null || _f === void 0 ? void 0 : _f.push({
                                        session: sessionId,
                                        asker: askerId,
                                        courseId: sessionDoc.get('courseId'),
                                        day: timeAddressed.toDate().getDay()
                                    });
                                    if (!((_g = taCounts[askerId]) === null || _g === void 0 ? void 0 : _g.has(answererId))) {
                                        (_h = taCounts[askerId]) === null || _h === void 0 ? void 0 : _h.set(answererId, 1);
                                    }
                                    else if (answererId && ((_j = taCounts[askerId]) === null || _j === void 0 ? void 0 : _j.has(answererId))) {
                                        taAmt = (_k = taCounts[askerId]) === null || _k === void 0 ? void 0 : _k.get(answererId);
                                        taAmt && ((_l = taCounts[askerId]) === null || _l === void 0 ? void 0 : _l.set(answererId, taAmt + 1));
                                    }
                                }
                                // Minutes spent at office hours
                                if (timeEntered) {
                                    if (timeAddressed) {
                                        minutesSpent = (timeAddressed.toDate().getTime() -
                                            timeEntered.toDate().getTime()) / 60000;
                                        if (minutesSpent >= 0) {
                                            userStats[askerId].totalMinutes += minutesSpent;
                                        }
                                        monthTimeCounts[askerId][timeEntered.toDate().getMonth()] += minutesSpent;
                                    }
                                    else {
                                        userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
                                        monthTimeCounts[askerId][timeEntered.toDate().getMonth()] += 60;
                                    }
                                    // eslint-disable-next-line no-console
                                    console.log("month counts: [" + monthTimeCounts[askerId] + "]");
                                }
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = questionsSnapshot.docs;
                _q.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                doc = _a[_i];
                return [5 /*yield**/, _loop_1(doc)];
            case 3:
                _q.sent();
                _q.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                _loop_2 = function (userId, stats) {
                    // eslint-disable-next-line no-console
                    console.log("name is " + userId);
                    stats.numVisits = (_m = officeHourSessions[userId]) === null || _m === void 0 ? void 0 : _m.length;
                    stats.totalMinutes = Math.ceil(stats.totalMinutes);
                    if (stats.timeHelpingStudents !== undefined) {
                        stats.timeHelpingStudents = Math.ceil(stats.timeHelpingStudents);
                        if (stats.numStudentsHelped !== undefined) {
                            stats.numStudentsHelped = TAsessions[userId].length;
                        }
                    }
                    // Personality type
                    var weeksInRange = (endDate.toDate().getTime() - startDate.toDate().getTime())
                        / (1000 * 60 * 60 * 24 * 7); // convert ms to weeks
                    var averageSessionsPerWeek = stats.numVisits / weeksInRange;
                    if (averageSessionsPerWeek >= 2) {
                        stats.personalityType = 'Consistent';
                    }
                    else if (averageSessionsPerWeek >= 0.5) {
                        stats.personalityType = 'Resourceful';
                    }
                    else {
                        stats.personalityType = 'Independent';
                    }
                    // Month user spent the most time in
                    stats.favMonth = (_o = monthTimeCounts[userId]) === null || _o === void 0 ? void 0 : _o.indexOf(Math.max.apply(Math, monthTimeCounts[userId]));
                    // Get the ids in the map that have the highest counts
                    if (taCounts[userId].size !== 0) {
                        stats.favTaId = Array.from(taCounts[userId].entries()).reduce(function (prev, next) { return prev[1] < next[1] ? next : prev; })[0];
                    }
                    // eslint-disable-next-line no-console
                    console.log(userId + "'s fav ta is " + stats.favTaId + ", taCounts length is " + taCounts[userId].size);
                    if (stats.favTaId) {
                        // eslint-disable-next-line no-console
                        console.log("here");
                        // only looking at the sessions from the favorite TA that match with sessions the user went to
                        var resSession = (_p = TAsessions[stats.favTaId]) === null || _p === void 0 ? void 0 : _p.filter(function (TAsession) {
                            return officeHourSessions[userId].includes(TAsession.session) && TAsession.asker === userId;
                        });
                        if ((resSession === null || resSession === void 0 ? void 0 : resSession.length) === 1) {
                            stats.favClass = resSession[0].courseId;
                            stats.favDay = resSession[0].day;
                            // eslint-disable-next-line no-console
                            console.log("finding " + userId + "'s mode stats");
                            // eslint-disable-next-line no-console
                            console.log(stats.favTaId + "'s total sessions");
                            // eslint-disable-next-line no-console
                            console.log(TAsessions[stats.favTaId]);
                            // eslint-disable-next-line no-console
                            console.log(stats.favTaId + ("'s total sessions with " + userId));
                            // eslint-disable-next-line no-console
                            resSession.map(function (x) { return console.log(x); });
                        }
                        else if ((resSession === null || resSession === void 0 ? void 0 : resSession.length) > 1) {
                            /* filtering from general to specific:
                                - find mode class
                                - out of all the sessions for that class, find mode day
                            */
                            // eslint-disable-next-line no-console
                            console.log("finding " + userId + "'s mode stats");
                            // eslint-disable-next-line no-console
                            console.log(stats.favTaId + "'s total sessions");
                            // eslint-disable-next-line no-console
                            console.log(TAsessions[stats.favTaId]);
                            // eslint-disable-next-line no-console
                            console.log(stats.favTaId + ("'s total sessions with " + userId));
                            // eslint-disable-next-line no-console
                            resSession.map(function (x) { return console.log(x); });
                            var classFrequency_1 = {};
                            var dayFrequency_1 = {};
                            /*
                                You need to find modeDay AFTER filtering all of modeCourse
                                because of the case where if you filter by looking at what
                                sessions have modeCourse AND modeDay, the modeDay might be a
                                number that doesn't exist with modeCourse.
                            */
                            resSession.forEach(function (TAsession) {
                                if (!classFrequency_1[TAsession.courseId]) {
                                    classFrequency_1[TAsession.courseId] = 1;
                                }
                                else {
                                    classFrequency_1[TAsession.courseId] += 1;
                                }
                            });
                            var modeCourseId_1 = Object.keys(classFrequency_1).reduce(function (a, b) {
                                return classFrequency_1[a] > classFrequency_1[b] ? a : b;
                            });
                            resSession.forEach(function (TAsession) {
                                if (TAsession.courseId === modeCourseId_1) {
                                    if (!dayFrequency_1[TAsession.day]) {
                                        dayFrequency_1[TAsession.day] = 1;
                                    }
                                    else {
                                        dayFrequency_1[TAsession.day] += 1;
                                    }
                                }
                            });
                            var modeDay_1 = Object.keys(dayFrequency_1).reduce(function (day1, day2) {
                                return dayFrequency_1[parseInt(day1, 10)] > dayFrequency_1[parseInt(day2, 10)] ? day1 : day2;
                            });
                            // eslint-disable-next-line no-console
                            console.log("modeCourse: " + modeCourseId_1 + " and modeDay: " + modeDay_1);
                            var modeSessions = resSession.filter(function (TAsession) { return TAsession.courseId === modeCourseId_1
                                && TAsession.day === parseInt(modeDay_1, 10); });
                            // eslint-disable-next-line no-console
                            console.log("final filtering for modeSessions");
                            // eslint-disable-next-line no-console
                            console.log(modeSessions);
                            // there could be multiple ties, so just picking the first one
                            stats.favClass = modeSessions[0].courseId;
                            stats.favDay = modeSessions[0].day;
                            // eslint-disable-next-line no-console
                            console.log("favClass: " + stats.favClass + ", favDay: " + stats.favDay);
                            // eslint-disable-next-line no-console
                            console.log("------------");
                        }
                    }
                };
                // Personality type will be calculated after processing all documents
                // Process stats
                for (_b = 0, _c = Object.entries(userStats); _b < _c.length; _b++) {
                    _d = _c[_b], userId = _d[0], stats = _d[1];
                    _loop_2(userId, stats);
                }
                return [4 /*yield*/, updateWrappedDocs()];
            case 6:
                _q.sent();
                // debugging console log
                // eslint-disable-next-line no-console
                errorUsers.forEach(function (errUser) { return console.log(errUser.user + ": " + errUser.error); });
                return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getWrapped()];
            case 1:
                _a.sent();
                // eslint-disable-next-line no-console
                console.log("Processing complete.");
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                // eslint-disable-next-line no-console
                console.error("Failed to update stats:", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
