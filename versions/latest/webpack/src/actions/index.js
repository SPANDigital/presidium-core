import axios from 'axios';

/* Need a way to pull this information from Jekyll as well. */
const ROOT_URL = 'http://127.0.0.1:4000/';
export const FETCH_SIDEBAR = 'FETCH_SIDEBAR';


export function fetchSidebar(toc_filename) {
    const url = `${ROOT_URL}${toc_filename}`;
    const request = axios.get(url);

    return {
        type: FETCH_SIDEBAR,
        payload: request
    };
}