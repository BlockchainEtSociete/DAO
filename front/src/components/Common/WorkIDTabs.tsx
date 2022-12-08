import { Typography } from "@mui/material";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SyntheticEvent, useEffect, useState } from "react";
import useEthContext from "../../hooks/useEthContext";
import EmployeePage from "../../pages/EmployeePage";
import Home from "../../pages/Home";
import EmployeeCardGenerator from "../EmployeeCard/EmployeeCardGenerator";
import EmployeeCardList from "../EmployeeCard/EmployeeCardsList";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ paddingLeft: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const WorkIDTabs = () => {
  const { state: { accounts, owner } } = useEthContext()

  const [connectedUser, setConnectedUser] = useState('')
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >  
            <Tab label="Home" {...a11yProps(0)}  />
            {connectedUser === owner && <Tab label="Employer" {...a11yProps(1)}  />}
            {connectedUser === owner && <Tab label="Employees list" {...a11yProps(2)} />}
            <Tab label="Employee" {...a11yProps(connectedUser === owner ? 3 : 1)}  />
          </Tabs>
          <TabPanel value={value} index={0}><Home /></TabPanel>
          {connectedUser === owner && <TabPanel value={value} index={1}><EmployeeCardGenerator /></TabPanel>}
          {connectedUser === owner && <TabPanel value={value} index={2}><EmployeeCardList /></TabPanel>}
          <TabPanel value={value} index={connectedUser === owner ? 3 : 1}><EmployeePage /></TabPanel>
      </Box>
    </>
  );
}

export default WorkIDTabs
