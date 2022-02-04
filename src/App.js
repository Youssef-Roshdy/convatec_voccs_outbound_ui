import React, { useState } from 'react';
import {
  ChakraProvider,
  theme,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack, Box, Button, Tooltip, Image,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Badge
} from '@chakra-ui/react';
import { FaMusic } from "react-icons/fa";
import ColorModeSwitcher from './components/ColorModeSwitcher/ColorModeSwitcher';
import AudioSettingPopUp from './components/AudioSettingPopUp/AudioSettingPopUp'
import Popup from './components/Popup/Popup';
import PhoneView from './components/PhoneView/PhoneView';
import Dashboard from './components/Dashboard/Dashboard';
import AgentMonitor from './components/AgentMonitor/AgentMonitor';
import ActiveTasks from './components/ActiveTasks/ActiveTasks';

function App() {
  const [tabIndex, setTabIndex] = React.useState(0)
  const [isOpen, setIsOpen] = useState(false);
  const togglePopup = () => {
      setIsOpen(!isOpen);
  }
  const [agentStatus, setAgentStatus] = useState('Offline');
  const [token, setToken] = useState('')
  const [screenMode, setScreenMode] = useState('light');
  const [workerRole, setWorkerRole] = useState('AGENT'); // AGENT, SUPERVISOR, ADMIN

  const agentMonitorView =
    <AgentMonitor tabIndex={tabIndex} key={'agentMonitor'} screenMode={screenMode} agentStatus={agentStatus} token={token}/>

  const activeTasksView = 
    <ActiveTasks tabIndex={tabIndex} key={'activeTasks'} screenMode={screenMode} agentStatus={agentStatus} token={token}/>
  
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Tabs align='end' onChange={(index) => setTabIndex(index)}>
          <HStack justifyContent='space-between' maxH="10vh" margin="0 10px 0 10px">
              <HStack>
                <Image
                  boxSize="8vw"
                  objectFit="contain"
                  src="/vcloud-logo-small.png"
                  alt="VCloud Agent Icon"
                />
                <Badge style={{marginTop: "21px"}} fontSize="1xl" colorScheme='purple'>CONVATEC</Badge>
              </HStack>
            <TabList>
              <Tab>Phone</Tab>
              <Tab>Dashboard</Tab>
              { workerRole !== 'AGENT' ? <Tab>Agent</Tab> : null }
              { workerRole !== 'AGENT' ? <Tab>Tasks</Tab> : null }
            </TabList>
            
            <HStack>
              <Tooltip label="Audio Settings">
                <Button style={{fontSize: "15px"}}  onClick={togglePopup}><FaMusic/></Button>
              </Tooltip>
              <Popup Content={AudioSettingPopUp} isOpen={isOpen} handleClose={togglePopup} screenMode={screenMode}/>
              <ColorModeSwitcher changeMode={setScreenMode} justifySelf="flex-end" />
            </HStack>
          </HStack>

          <Alert id="token-alert" status="error" style={{display: 'none', margin: "10px 0px 1px 0px"}}>
            <AlertIcon />
            <AlertTitle>Your Token Has Expired!!</AlertTitle>
            <AlertDescription>Please refresh your browser</AlertDescription>
          </Alert>

          <TabPanels h="90vh" w="100vw">
              <TabPanel h="100%" w="100%">
                <PhoneView 
                  screenMode = {screenMode} 
                  setWorkerRole={setWorkerRole}
                  agentStatus={agentStatus}
                  setAgentStatus={setAgentStatus}
                  token={token}
                  setToken={setToken}
                />
              </TabPanel>
              <TabPanel>
                <Dashboard tabIndex={tabIndex} key={'dashboard'} token={token} />
              </TabPanel>
              <TabPanel> { workerRole !== 'AGENT' ? agentMonitorView : null } </TabPanel>
              <TabPanel> { workerRole !== 'AGENT' ? activeTasksView : null } </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </ChakraProvider>
  );
}

export default App;
