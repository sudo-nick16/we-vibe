import { useMemo } from 'react';
import {BrowserRouter as Router, Switch} from 'react-router-dom';
import './App.css';
import Main from './components/Main';
import CustomRoute from './routes/CustomRoute';
import { UserContext } from './context/UserContext';
import useStateRef from './hooks/useStateRef';


function App() {
  const [userState, setUserState, userStateRef] = useStateRef({
    roomId : "",
    username : "",
    img : "",
    joined : false,
    currSong : { title : "", url : "", thumbnail : ""},
    playlist : [],
    playing : false,
  })

  const provider = useMemo(()=>({userState, setUserState, userStateRef}), [userState]);

  return (
    <UserContext.Provider value = {provider} >
      <Router>
        <Switch>
          <CustomRoute path = "/:room_id" component = {Main} />
          <CustomRoute path = "/" component = {Main} />
        </Switch>
      </Router>
    </UserContext.Provider>
  );
}
export default App;
