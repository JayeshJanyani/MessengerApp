import * as actionTypes from '../actions/types';
import {combineReducers} from 'redux'

const initialUserState={
    currentUser:null,
    isLoading:true
}

//user reducer

const user_reducer=(state=initialUserState,action)=>{
    switch(action.type){
        case actionTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading:false
            }
            
            case actionTypes.CLEAR_USER:
                return {
                    ...state,
                    isLoading: false
                }

            default:
                return state;
    }
}

//channel reducer

const initialChannelState={
    currentChannel:null
}

const channel_reducer=(state=initialChannelState,action)=>{
    switch(action.type){
        case actionTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel: action.payload.currentChannel
            }
        default: return state
    }
}


const rootReducer= combineReducers({
    user: user_reducer,
    channel: channel_reducer
})

export default rootReducer;