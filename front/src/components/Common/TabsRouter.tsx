import { useState, useEffect } from "react";
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
  const routeMatch = useRouteMatch(['/', '/employer', '/employee'])
  const currentTab = routeMatch?.pattern?.path

  const { state: { accounts, owner } } = useEthContext()

  const [connectedUser, setConnectedUser] = useState('')

  useEffect(() => {
      setConnectedUser(accounts[0])
  }, [accounts, setConnectedUser])

  return (
    <Tabs value={currentTab}>  
      <Tab label="Home" value='/' to='/' component={Link} />
    {connectedUser === owner &&
      <Tab label="Employer" value="/employer" to='/employer' component={Link} />
    }
    <Tab label="Employee" value="/employee" to='/employee' component={Link} />
    </Tabs>
  );
}

const TabsRouter = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <>
        <MyTabs />
        <p>&nbsp;</p>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/employer' element={<EmployeeCardGenerator />} />
          <Route path='/employee' element={<EmployeePage />} />
        </Routes>
      </>
    </Box>
  );
}

export default TabsRouter
