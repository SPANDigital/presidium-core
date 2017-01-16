import { combineReducers } from 'redux';
import ListReducer from './reducer_list';

const rootReducer = combineReducers({
    app: ListReducer
});

export default rootReducer;

