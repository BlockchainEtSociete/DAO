import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import EthProvider from './contexts/EthContext/EthProvider';
import WorkIDTabs from './components/Common/WorkIDTabs';
import Header from './components/Common/Header';
import { createTheme, ThemeProvider } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <EthProvider>
        <Header />
        <WorkIDTabs />
      </EthProvider>
    </ThemeProvider>
  );
}

export default App;
