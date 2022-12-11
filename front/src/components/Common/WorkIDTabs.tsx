import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useState } from "react";
import { Link, matchPath, Route, Routes, useLocation } from 'react-router-dom';
import useEthContext from "../../hooks/useEthContext";
import EmployeePage from "../../pages/EmployeePage";
import EmployerPage from '../../pages/EmployerPage';
import Governance from '../../pages/Governance';
import Home from "../../pages/Home";
import Stacking from '../../pages/Stacking';
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
  const routeMatch = useRouteMatch(['/', '/employer', '/employees-list', '/employee', '/stacking', '/governance']);
  const currentTab = routeMatch?.pattern?.path || '/';
  const { state: { accounts, owner } } = useEthContext()

  const [connectedUser, setConnectedUser] = useState('')

  useEffect(() => {
      setConnectedUser(accounts[0])
  }, [accounts, setConnectedUser])

  return (
    <>
      <Box 
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '100%', clear: 'both' }}
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
            <Tab label="Stacking" value='/stacking' to='/stacking' component={Link} />
            <Tab label="Governance" value='/governance' to='/governance' component={Link} />
          </Tabs>          
          <Routes>
            <Route path='/' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><Home /></Box>} />
            <Route path='/employer' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><EmployerPage /></Box>} />
            <Route path='/employees-list' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><EmployeeCardList /></Box>} />
            <Route path='/employee' element={<Box sx={{ ppaddingLeft: 3, paddingRight: 3, width: "100%" }}><EmployeePage /></Box>} />
            <Route path='/stacking' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><Stacking /></Box>} />
            <Route path='/governance' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><Governance /></Box>} />
          </Routes>
      </Box>
    </>
  );
}

export default WorkIDTabs
