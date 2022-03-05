import {combineReducers} from "redux";
import auth from "./auth"
import course from "./course"

export default combineReducers({auth, course});