import './App.scss';
import EthProvider from './contexts/EthContext/EthProvider';
import WorkIDTabs from './components/Common/WorkIDTabs';
import Header from './components/Common/Header';
import { createTheme, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router} from 'react-router-dom';

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
          <WorkIDTabs />
        </Router>
      </EthProvider>
    </ThemeProvider>
  );
}

export default App;
