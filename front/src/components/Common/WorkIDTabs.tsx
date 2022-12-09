import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useState } from "react";
import { Link, matchPath, Route, Routes, useLocation } from 'react-router-dom';
import useEthContext from "../../hooks/useEthContext";
import EmployeePage from "../../pages/EmployeePage";
import EmployerPage from '../../pages/EmployerPage';
import Home from "../../pages/Home";
import EmployeeCardList from "../EmployeeCard/EmployeeCardsList";

const useRouteMatch = (patterns: string[]) => {
  const { pathname } = useLocation();

  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) {
      return possibleMatch;
    }
  }

  return null;
}

const WorkIDTabs = () => {
  const routeMatch = useRouteMatch(['/', '/employer', '/employees-list', '/employee']);
  const currentTab = routeMatch?.pattern?.path || '/';
  const { state: { accounts, owner } } = useEthContext()

  const [connectedUser, setConnectedUser] = useState('')

  useEffect(() => {
      setConnectedUser(accounts[0])
  }, [accounts, setConnectedUser])

  return (
    <>
      <Box sx={{ padding: 0, marginLeft: '10px'}}>
        <img src="/WorkID_logo.png" alt="WorkID" />
        <p>&nbsp;</p>
      </Box>
      <Box 
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '100%' }}
      >
          <Tabs 
            orientation="vertical"
            variant="scrollable"
            value={currentTab}
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >  
            <Tab label="Home" value='/' to='/' component={Link} />
            {connectedUser === owner && <Tab label="Employer" value='/employer' to='/employer' component={Link} />}
            {connectedUser === owner && <Tab label="Employees list" value='/employees-list' to='/employees-list' component={Link} />}
            <Tab label="Employee"  value='/employee' to='/employee' component={Link}  />
          </Tabs>          
          <Routes>
            <Route path='/' element={<Box sx={{ paddingLeft: 3 }}><Home /></Box>} />
            <Route path='/employer' element={<Box sx={{ paddingLeft: 3 }}><EmployerPage /></Box>} />
            <Route path='/employees-list' element={<Box sx={{ paddingLeft: 3 }}><EmployeeCardList /></Box>} />
            <Route path='/employee' element={<Box sx={{ paddingLeft: 3 }}><EmployeePage /></Box>} />
          </Routes>
      </Box>
    </>
  );
}

export default WorkIDTabs
