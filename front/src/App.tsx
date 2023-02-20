import './App.scss';
import EthProvider from './contexts/EthContext/EthProvider';
import Header from './components/Common/Header';
import { createTheme, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router} from 'react-router-dom';
import DAOTabs from './components/Common/DAOTabs';  

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <EthProvider>
        <Router>
          <Header />
          <DAOTabs />
        </Router>
      </EthProvider>
    </ThemeProvider>
  );
}

export default App;
