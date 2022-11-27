import React, { useRef } from "react";
import { useEffect } from "react";
import useEthContext from "../../hooks/useEthContext";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
  Route,
  Routes,
  Link,
  matchPath,
  useLocation,
} from 'react-router-dom';
import Home from "../../pages/Home";
import EmployeeCardGenerator from "../EmployeeCard/EmployeeCardGenerator";
import EmployeePage from "../../pages/EmployeePage";

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

const MyTabs = () => {
  const routeMatch = useRouteMatch(['/', '/employer', '/employee']);
  const currentTab = routeMatch?.pattern?.path;

  const { state: { accounts, contract, networkID, owner }, dispatch } = useEthContext();

  let connectedUser = useRef(accounts[0])
  let network = useRef(networkID)

  useEffect(() => {
      connectedUser.current = accounts[0]
      network.current = networkID
  }, [accounts, connectedUser, contract, dispatch, networkID])

  return (
    <Tabs value={currentTab}>  
      <Tab label="Home" value='/' to='/' component={Link} />
    {connectedUser.current === owner &&
      <Tab label="Employer" value="/employer" to='/employer' component={Link} />
    }
    <Tab label="Employee" value="/employee" to='/employee' component={Link} />
    </Tabs>
  );
}

const TabsRouter = () => {
  const { state: { accounts } } = useEthContext();

  return (
    <Box sx={{ width: '100%' }}>
      {accounts && accounts[0] &&
      <>
        <MyTabs />
        <p>&nbsp;</p>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/employer' element={<EmployeeCardGenerator />} />
          <Route path='/employee' element={<EmployeePage />} />
        </Routes>
      </>
      }
    </Box>
  );
}

export default TabsRouter
