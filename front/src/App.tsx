import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import EthProvider from './contexts/EthContext/EthProvider';
import TabsRouter from './components/Common/TabsRouter';
import Header from './components/Common/Header';

function App() {
  return (
    <EthProvider>
      <Header />
      <Router>
        <TabsRouter />
      </Router>
    </EthProvider>
  );
}

export default App;
