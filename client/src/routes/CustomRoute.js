import React, { Component } from 'react'
import { Redirect, Route, useHistory } from 'react-router';
import Login from '../components/Login';
import Main from '../components/Main';

const CustomRoute = ({component : Component, ...rest}) => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem("user"))
    console.log("router exec")
    return (user?
        <Route render={props => <Component {...props}/>} {...rest} />
        :
        <Redirect to="/profile" />)
    
}

export default CustomRoute
