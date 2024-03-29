import {UPDATE_USER, UPDATE_AUTH, LOGOUT_CLEAR} from "./Types"
import type {AppDispatch} from "../store"

export const updateUser = (user: FireUser | undefined) =>  async (dispatch: AppDispatch) => {
    const payload = {
        user
    };
    dispatch({
        type: UPDATE_USER,
        payload
    })
}

export const updateAuthStatus = (authState: boolean) => async (dispatch: AppDispatch) => {
    const payload = {
        authState
    }
    dispatch({
        type : UPDATE_AUTH,
        payload
    })
    if(!authState) dispatch({type: LOGOUT_CLEAR})
}