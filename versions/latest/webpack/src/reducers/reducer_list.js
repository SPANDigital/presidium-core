import { FETCH_SIDEBAR } from '../actions/index';

const INITIAL_STATE = { list: [] };

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case FETCH_SIDEBAR:
            return { list: action.payload.data };
        default:
            return state;
    }
}
