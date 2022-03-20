import type {AppDispatch} from "../store"
import {
    ADD_BANNER, 
    REMOVE_BANNER, 
    ADD_SNACKBAR, 
    REMOVE_SNACKBAR, 
    ADD_SESSION_BANNER, 
    REMOVE_SESSION_BANNER
} from "./Types"

export const addBanner = (banner: Announcement, session?: boolean) =>  async (dispatch: AppDispatch) => {
    banner.global = session ? !session : true;  
    const payload = {
        banner
    };
    if(session) {
        dispatch({
            type: ADD_SESSION_BANNER,
            payload
        })
    } else {
        dispatch({
            type: ADD_BANNER,
            payload
        })
    }
}

export const addSnackbar = (snackbar: Announcement) =>  async (dispatch: AppDispatch) => {
    const payload = {
        snackbar
    };
    dispatch({
        type: ADD_SNACKBAR,
        payload
    });
    setTimeout(() => {
        dispatch({
            type: REMOVE_SNACKBAR,
            payload : {
                snackbar: snackbar.text
            }
        })
    }, 5000)
}

export const removeBanner = (banner: string, session?: boolean) =>  async (dispatch: AppDispatch) => {
    const payload = {
        banner
    };
    if(session) {
        dispatch({
            type: REMOVE_SESSION_BANNER,
            payload
        })
    } else {
        dispatch({
            type: REMOVE_BANNER,
            payload
        })
    }
}

export const removeSnackbar = (snackbar: string) =>  async (dispatch: AppDispatch) => {
    const payload = {
        snackbar
    };
    dispatch({
        type: REMOVE_SNACKBAR,
        payload
    })
}