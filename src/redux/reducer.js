import { combineReducers } from "redux";

const initialState ={
    name:'Yuono edi'
}

const initialStateRegister ={
    form:{
        fullname:'',
        email:'',
        password:''
    },
    title:'Register Page',
    desc:'ini adalah desc untuk Register'
}

const initialStateLogin ={
    form:{
        email:'',
        password:''
    },
    info:'Tolong masukkan password anda',
    isLogin:true
}


const initialStatePaket ={
    form:{
        NamaPaket:'',
        NamaSource:''
    },
    info:''
}

const RegisterReducer = (state=initialStateRegister,action)=>{
    if(action.type==="SET_TITLE"){
        return {
            ...state,
            title:'Register gaanti title'
        }
    }

    if(action.type==="SET_FORM"){
        return {
            ...state,
            form:{
                ...state.form,
                [action.inputType]:action.inputValue
            }
        }
    }

    return state;
}

const LoginReducer = (state=initialStateLogin,action)=>{
    if(action.type==="SET_FORM"){
        return {
            ...state,
            form:{
                ...state.form,
                [action.inputType]:action.inputValue
            }
        }
    }
    return state;
}

const PaketReducer = (state=initialStatePaket,action)=>{
    if(action.type==="SET_FORM"){
        return {
            ...state,
            form:{
                ...state.form,
                [action.inputType]:action.inputValue
            }
        }
    }
    return state;
}


const reducer =combineReducers({
    RegisterReducer,
    LoginReducer,
    PaketReducer
});

export default reducer;