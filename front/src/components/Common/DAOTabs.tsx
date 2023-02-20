import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useState } from "react";
import { Link, matchPath, Route, Routes, useLocation } from 'react-router-dom';
import useEthContext from "../../hooks/useEthContext";
import MemberPage from "../../pages/MemberPage";
import EmployerPage from '../../pages/AdministratorPage';
import Governance from '../../pages/Governance';
import Home from "../../pages/Home";
import MemberCardList from "../MemberCard/MemberCardsList";

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

const DAOTabs = () => {
  const routeMatch = useRouteMatch(['/', '/administrator', '/members-list', '/member', '/stacking', '/governance']);
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
            <Tab label="Accueil" value='/' to='/' component={Link} />
            {connectedUser === owner && <Tab label="Administration" value='/administrator' to='/administrator' component={Link} />}
            {connectedUser === owner && <Tab label="Liste des membres" value='/members-list' to='/members-list' component={Link} />}
            <Tab label="Profil"  value='/member' to='/member' component={Link}  />
            <Tab label="Governance" value='/governance' to='/governance' component={Link} />
          </Tabs>          
          <Routes>
            <Route path='/' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><Home /></Box>} />
            <Route path='/administrator' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><EmployerPage /></Box>} />
            <Route path='/members-list' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><MemberCardList /></Box>} />
            <Route path='/member' element={<Box sx={{ ppaddingLeft: 3, paddingRight: 3, width: "100%" }}><MemberPage /></Box>} />
            <Route path='/governance' element={<Box sx={{ paddingLeft: 3, paddingRight: 3, width: "100%" }}><Governance /></Box>} />
          </Routes>
      </Box>
    </>
  );
}

export default DAOTabs
