import type {AppDispatch} from "../store"
import {ADD_BANNER, REMOVE_BANNER, ADD_SNACKBAR, REMOVE_SNACKBAR} from "./Types"

export const addBanner = (banner: Announcement) =>  async (dispatch: AppDispatch) => {
    const payload = {
        banner
    };
    dispatch({
        type: ADD_BANNER,
        payload
    })
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

export const removeBanner = (banner: string) =>  async (dispatch: AppDispatch) => {
    const payload = {
        banner
    };
    dispatch({
        type: REMOVE_BANNER,
        payload
    })
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