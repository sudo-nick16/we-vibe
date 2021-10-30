import { createContext, useMemo, useState } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import Main from './components/Main';
import Login from './components/Login';
import New from './components/New'

function App() {
  const [userState, setUserState] = useState({
    roomId : null
  })
  const UserContext = createContext(()=>({useState, setUserState}));
  const provider = useMemo(()=>({userState, setUserState}), [userState]);

  return (
    <UserContext.Provider value = {provider} >
      <Router>
        <Switch>
          <Route exact path = "/" component = {Login} />
          <Route path = "/home" component = {Main} />
          <Route path = "/sakura" component = {New} />
        </Switch>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
