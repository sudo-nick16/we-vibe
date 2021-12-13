import React, { useContext, useEffect } from 'react'
import { Route } from 'react-router';
import { UserContext } from '../context/UserContext';

const CustomRoute = ({component : Component, ...rest}) => {
    const {userState, setUserState} = useContext(UserContext);
    const user = JSON.parse(localStorage.getItem("user"))
    useEffect(() => {
        if(user){
            const {username, img} = user;
            setUserState(user => ({...user, username, img}));
        }
    }, [])
    return (user?
        <Route render={props => <Component {...props} profile = {false} />} {...rest} />
        :
        <Route render={props => <Component {...props} profile = {true}  />} {...rest} />
        )
}

export default CustomRoute
