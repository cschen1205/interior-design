import CanvasScene from './components/CanvasScene';
import Sidebar from './components/UI/Sidebar';
import Header from './components/UI/Header';
import './styles/global.css';

const App = () => (
  <div className="app">
    <Header />
    <Sidebar />
    <CanvasScene />
  </div>
);

export default App;
