import {UPDATE_COURSE, UPDATE_SESSION} from "./Types";
import type {AppDispatch} from "../store";

export const updateCourse = (course: FireCourse | undefined) =>  async (dispatch: AppDispatch) => {
    const payload = {
        course
    };
    dispatch({
        type: UPDATE_COURSE,
        payload
    })
}

export const updateSession = (session: FireSession | undefined) =>  async (dispatch: AppDispatch) => {
    const payload = {
        session
    };
    dispatch({
        type: UPDATE_SESSION,
        payload
    })
}