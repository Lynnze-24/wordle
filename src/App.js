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

function App() {


  return (
    <ClickwordProvider>
    <Router>
    <div className="App">
      <Header />
     
      <Routes>
        <Route exact path='/' element={<Main />}/>
      
        <Route path='/howToPlay' element={<About />} />

        
       
      </Routes>
     
    </div>
    </Router>
    </ClickwordProvider>
  );
}

export default App;
