import './App.css';
import Header from './components/header/Header';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import About from './pages/About';
import GameProvider from './components/context/GameProvider';
import Main from './pages/Main';
import Setting from './pages/Setting';
import SettingProvider, { useSettingContext } from './components/context/SettingProvider';
import ToastProvider from './components/toast/Toast';
import StatsModal from './components/stats/StatsModal';

const Shell = () => {
  const { colorBlind } = useSettingContext();

  return (
    <div className={colorBlind ? 'App contrast' : 'App'}>
      <Header />

      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/howToPlay' element={<About />} />
        <Route path='/setting' element={<Setting />} />
        <Route path='*' element={<Main />} />
      </Routes>

      <StatsModal />
    </div>
  );
};

function App() {
  return (
    <SettingProvider>
      <GameProvider>
        <ToastProvider>
          <Router>
            <Shell />
          </Router>
        </ToastProvider>
      </GameProvider>
    </SettingProvider>
  );
}

export default App;
