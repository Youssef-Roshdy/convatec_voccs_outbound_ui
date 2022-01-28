import React, { useState } from 'react';
import {
    Table,
    Thead, Tbody,
    Tr, Th, Td,
    SkeletonText,
    Box, Text, HStack,
    Heading,
    Divider,
    Select, Button,
    Input, InputLeftElement, InputGroup
} from "@chakra-ui/react"
import { BsSearch } from "react-icons/bs";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { SERVER_BASE } from '../../constants';
import _ from "lodash";
import useInterval from 'use-interval'
import Axios from 'axios';
import Popup from '../Popup/Popup';
import EditPopUp from '../EditPopUp/EditPopUp';

export default function AgentMonitor({ screenMode, token, tabIndex }){
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('');
    const [sort, setSort] = useState({
        "type": '',
        "by": ''
    });
    const [workerData, setWorkerData] = useState(
        {
            "online": [
                {
                    "friendlyName": "testing",
                    "activityName": "actName",
                    "sid": "123456789", 
                    "timeInStatus": "11:11", 
                    'skills': ["none"], 
                    'skillsEnabled': ['none'], 
                    'skillsDisabled': ['none']
                }
            ], 
            "offline": [
                {
                    "friendlyName": "testing",
                    "activityName": "actName",
                    "sid": "123456789", 
                    "timeInStatus": "11:11", 
                    'skills': ["none"], 
                    'skillsEnabled': ['none'], 
                    'skillsDisabled': ['none']
                }
            ]
        }
    );
    const [isOpen, setIsOpen] = useState(false);
    const togglePopup = () => setIsOpen(!isOpen);
    const [workerValue, setWorkerValue] = useState({});
    
    const handleStatusChange = (status, workerSid) => {
        console.log("status update called");
        const url = `${SERVER_BASE}/status-change`;
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                status_update: status,
                worker_sid: workerSid,
                Token: token
            })
        };

        fetch(url, options)
        .then(response => {console.log(response.status)})
        .catch(err => console.log(err))
    }
    
    useInterval(() => {
        if (tabIndex === 2) {
            if (!isOpen) {
                Axios.get(`${SERVER_BASE}/agent-data?Token=${token}`).then((response) => {
                    setWorkerData(response.data.wkdata);
                });
            }
        }
    }, 3000)
    
    let workerOnlineArray = workerData.online.filter(worker => worker.friendlyName.includes(searchTerm.toLowerCase()));
    let workerOfflineArray = workerData.offline.filter(worker => worker.friendlyName.includes(searchTerm.toLowerCase()));
    if (filterType !== '') {
        workerOnlineArray = workerOnlineArray.filter(worker => worker.activityName === filterType);
        workerOfflineArray = workerOfflineArray.filter(worker => worker.activityName === filterType);
    }
    // Sort Time in Status
    if (sort.type !== '') {
        workerOnlineArray = _.sortBy(workerOnlineArray, [sort.by]); 
        if (sort.type === 'desc') {
            workerOnlineArray.reverse()
        }
    }
    function displayRows(type, worker, i) {
        return (
            <Tr key={`${type}_Tr-`+i}>
                <Th key={`${type}_Th-`+i}>{worker.friendlyName}</Th>
                <Td key={`${type}_Td1-`+i} textAlign="center">
                    <Select 
                        id={"selectStatus-" + i}
                        variant="filled"
                        value={worker.activityName} 
                        onChange={ (e) => {
                            handleStatusChange(e.target.value, worker.sid)
                        }}
                        style={{ textAlignLast: 'center'}}
                    >
                        {
                            worker.activityName === 'OnTask'
                            ? <option value="OnTask">OnTask</option>
                            :
                            <>
                            <option value="Offline">Offline</option>
                            <option style={{display:'none'}} value="Unavailable/Missed">Unavailable/Missed</option>
                            <option value="Available">Available</option>
                            <option value="Standby">Standby</option>
                            <option value="Break">Break</option>
                            <option value="Bio-Break">Bio-Break</option>
                            <option value="Training/Supervisor">Training/Supervisor</option>
                            <option style={{display:'none'}} value="WrapUp">Wrap-Up</option>
                            <option style={{display:'none'}} value="OnCall">OnCall</option>
                            <option style={{display:'none'}} value="OnTask">OnTask</option>
                            <option value="Lunch">Lunch</option>
                            <option style={{display:'none'}} value="Reserved">Reserved</option>
                            </>
                        }
                    </Select>
                </Td>
                <Td key={`${type}_Td2-`+i} textAlign="center">{worker.timeInStatus}</Td>
                <Td key={`${type}_Td3-`+i} textAlign="-webkit-center">
                    <Td key={`${type}_Td4-`+i}>
                        <Button 
                            onClick={() => {
                                togglePopup();
                                setWorkerValue(worker);
                            }}
                        >Edit
                        </Button>
                        {
                            isOpen 
                            ? <Popup 
                                Content={
                                    () => isOpen 
                                    ? 
                                        <EditPopUp 
                                            worker={workerValue} 
                                            setWorkerData={setWorkerData} 
                                            handleClose={togglePopup}
                                            token={token} 
                                        /> 
                                    : null
                                } 
                                isOpen={isOpen} 
                                handleClose={togglePopup} 
                                screenMode={screenMode}
                            />
                            : null
                        }
                    </Td>
                </Td>
            </Tr>
        );
    }
    const onlineWorkers = workerOnlineArray.map((worker, i) =>
        displayRows("On", worker, i)
    );

    const offlineWorkers = workerOfflineArray.map((worker, i) =>
        displayRows("Off", worker, i)
    );
        
    const loadingSkeleton =  
        <Tr>
            <Th><SkeletonText mt="3" noOfLines={3} spacing="3"/></Th>
            <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
            <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
            <Td>
                <Td><Button isLoading={true}>Edit</Button></Td>
            </Td>
        </Tr>
    const [renderTable, setRenderTable] = useState(true);

    function handleRenderTable() {
        setTimeout(() => {
            setRenderTable(false);    
        }, 1000)
    }
    function handleDisplayData(workerType) {
        if (document.getElementById("no-available-data")) {
            if (workerType === 'available') {
                if (onlineWorkers.length < 1) {
                    document.getElementById("no-available-data").style.display = "block";
                } else if(renderTable || workerData.online[0].friendlyName === "testing") {
                    document.getElementById("no-available-data").style.display = "none";
                    return loadingSkeleton
                } else {
                    document.getElementById("no-available-data").style.display = "none";
                    return onlineWorkers
                }
            } else if (workerType === 'offline') {
                if (offlineWorkers.length < 1) {
                    document.getElementById('no-offline-data').style.display = "block";
                } else if(renderTable || workerData.offline[0].friendlyName === 'testing') {
                    document.getElementById('no-offline-data').style.display = "none";
                    return loadingSkeleton
                } else {
                    document.getElementById('no-offline-data').style.display = "none";
                    return offlineWorkers
                }
            }
        }
    }
    
    return [
        <div id="agentMonitor-container" style={{textAlign: 'center'}}>
            <Box d="flex" flexDir="column" alignItems="center">
                <Heading as="h1" size="md" textAlign="center">VOCCS AGENT MONITOR</Heading>
                <div style={{width: "50%"}}>
                    <InputGroup m="15px">
                        <InputLeftElement
                            pointerEvents="none"
                            children={<BsSearch color="gray.300" />}
                        />
                        <Input 
                            size="md" 
                            placeholder="Search Agent"
                            variant="filled" 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                            }}
                        />
                        <Select 
                            id="statusFilter"
                            w="40%"
                            style={{ marginLeft: "10px", textAlignLast: 'center'}}
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            placeholder="All">  
                                <option value="Offline">Offline</option>
                                <option style={{display:'none'}} value="Unavailable/Missed">Unavailable/Missed</option>
                                <option value="Available">Available</option>
                                <option value="Standby">Standby</option>
                                <option value="Break">Break</option>
                                <option value="Bio-Break">Bio-Break</option>
                                <option value="Training/Supervisor">Training/Supervisor</option>
                                <option style={{display:'none'}} value="WrapUp">Wrap-Up</option>
                                <option style={{display:'none'}} value="OnCall">OnCall</option>
                                <option style={{display:'none'}} value="OnTask">OnTask</option>
                                <option value="Lunch">Lunch</option>
                                <option style={{display:'none'}} value="Reserved">Reserved</option>
                        </Select>
                    </InputGroup>
                </div>
            </Box>
            <div id="main-header"></div>
            <Divider />
            <Heading color="green.500" m={3}>Online</Heading>
            <Table variant="striped" colorScheme="blue.600" size="sm">
                <Thead>
                    <Tr>
                        <Th>
                            <HStack d="flex">
                                <Text>Agent</Text>
                                <AiFillCaretDown color={sort.type === 'desc'&& sort.by === "friendlyName"  ? 'green' : ''} onClick={()=> setSort({type: 'desc', by: "friendlyName"})}/>
                                <AiFillCaretUp color={sort.type === 'asc' && sort.by === "friendlyName" ? 'green' : ''} onClick={()=> setSort({type: 'asc', by: "friendlyName"})}/>
                            </HStack>
                        </Th>
                        <Th textAlign="center">Status</Th>
                        <Th textAlign="center">
                            <HStack d="flex" justifyContent="center" textAlign="center">
                                <Text>Time In Status</Text>
                                <AiFillCaretDown color={sort.type === 'desc'&& sort.by === "timeInStatus"  ? 'green' : ''} onClick={()=> setSort({type: 'desc', by: "timeInStatus"})}/>
                                <AiFillCaretUp color={sort.type === 'asc' && sort.by === "timeInStatus" ? 'green' : ''} onClick={()=> setSort({type: 'asc', by: "timeInStatus"})}/>
                            </HStack>
                        </Th>
                        <Th textAlign="center">Skills</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        handleRenderTable()
                    }
                    {
                        handleDisplayData('available')
                    }
                </Tbody>
            </Table>
            <div id="no-available-data" style={{display: 'none', padding: "10px"}}>
                <Heading size="md">There are no matching data</Heading>
            </div>

            <Heading color="red.500" m={3}>Offline</Heading>
            <Table variant="striped" colorScheme="blue.600" size="sm">
                <Thead>
                    <Tr>
                        <Th>Agent</Th>
                        <Th textAlign="center">Status</Th>
                        <Th textAlign="center">Time In Status</Th>
                        <Th textAlign="center">Skills</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        handleRenderTable()
                    }
                    {
                        handleDisplayData('offline')
                    }
                </Tbody>
            </Table>
            <div id="no-offline-data" style={{display: 'none', padding: "10px"}}>
                <Heading size="md">There are no matching data</Heading>
            </div>
        </div>
    ]
}
