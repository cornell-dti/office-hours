import {UPDATE_USER} from "./Types"
import type {AppDispatch} from "../store"

export const updateUser = (user: FireUser) => async (dispatch: AppDispatch) => {
    const payload = {
        user
    };
    dispatch({
        type: UPDATE_USER,
        payload
    })
}