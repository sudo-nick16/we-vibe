import { createContext, useEffect, useMemo, useState } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import Main from './components/Main';
import Login from './components/Login';
import CustomRoute from './routes/CustomRoute';
import { UserContext } from './context/UserContext';
import useStateRef from './hooks/useStateRef';


function App() {
  const [load, setLoad] = useState(false);
  const [userState, setUserState, userStateRef] = useStateRef({
    roomId : "",
    username : "",
    img : "",
    joined : false,
    currSong : { title : "", url : "", thumbnail : ""},
    playlist : [],
    playing : false,
  })
  console.log(userStateRef);

  const provider = useMemo(()=>({userState, setUserState, userStateRef}), [userState]);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if(user){
      const {username, img} = user;
      setUserState(user => ({...user, username, img}));
    }
    setLoad(true);
  }, [])

  return (
    load?
    <UserContext.Provider value = {provider} >
      <Router>
        <Switch>
          <Route exact path = "/profile" component = {Login} />
          <CustomRoute path = "/:room_id" component = {Main} />
          <CustomRoute path = "/" component = {Main} />
        </Switch>
      </Router>
    </UserContext.Provider>
    :
    null
  );
}
export default App;
