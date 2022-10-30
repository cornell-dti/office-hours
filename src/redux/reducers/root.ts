import {combineReducers} from "redux";
import auth from "./auth"
import course from "./course"
import announcements from "./announcements"

export default combineReducers({auth, course, announcements});