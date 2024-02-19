import { combineReducers } from "redux";
import auth from "./auth"
import course from "./course"
import announcements from "./announcements"
import notifications from "./notifications"

export default combineReducers({ auth, course, announcements, notifications });