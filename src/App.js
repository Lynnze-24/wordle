import './App.css';
import Header from './components/header/Header';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import About from './pages/About';
import ClickwordProvider from './components/context/ClickwordProvider';
import Main from './pages/Main';
import Setting from './pages/Setting';
import SettingProvider from './components/context/SettingProvider';

// dictionary api
//https://api.dictionaryapi.dev/api/v2/entries/en/<word>

function App() {

  

  return (
    <ClickwordProvider>
      <SettingProvider>
    <Router>
    <div className="App">
      <Header />
     
      <Routes>
        <Route exact path='/' element={<Main />}/>
      
        <Route path='/howToPlay' element={<About />} />
        <Route path='/setting' element={<Setting />} />
        
       
      </Routes>
     
    </div>
    </Router>
    </SettingProvider>
    </ClickwordProvider>
  );
}

export default App;
