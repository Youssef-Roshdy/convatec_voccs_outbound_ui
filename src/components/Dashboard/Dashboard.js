import React, { useState } from 'react';
import { Heading, Stack, Divider, Box } from "@chakra-ui/react"
import { 
    IoMdCheckmarkCircle, IoMdCloseCircle,
    IoIosRemoveCircle, IoMdCall
} from "react-icons/io";
import Axios from 'axios';
import useInterval from 'use-interval'
import Queues from './Queues';
import { SERVER_BASE } from '../../constants';

export default function Dashboard({ token, tabIndex }){
    const [dashboardData, setDashboardData] = useState(
        {
            "active": 0, 
            "longWait": 0, 
            "waiting": 0, 
            "reserved": 0,
            "agentAvailable": 0,
            "agentOncall": 0, 
            "agentWrapping": 0, 
            "agentUnavailable": 0,
            "agentOffline": 0, 
            "qData": []
        }
    );
    useInterval(() => {
        if (tabIndex === 1) {
            Axios.get(`${SERVER_BASE}/dashboard?Token=${token}`).then((response) => {
                setDashboardData(response.data.data);
            });
        }
    }, 3000)

    return (
        <Stack spacing={3} id="dashboard-container">
            <Heading as="h1" size="md" alignSelf="center" m={3}>VOCCS DASHBOARD</Heading>
            <Divider />
            <Box d="flex" textAlign="center" justifyContent="space-around">
                <Box flexGrow="100" m="10px" p="10px" borderWidth="1px" borderRadius="lg">
                    <Heading size="xs">ACTIVE TASKS </Heading>
                    <Heading marginTop="inherit" size="2xl"> {dashboardData.active}</Heading>
                </Box>
                <Box flexGrow="100" m="10px" p="10px" borderWidth="1px" borderRadius="lg">
                    <Heading size="xs">WAITING TASKS </Heading>
                    <Heading marginTop="inherit" size="2xl"> {dashboardData.waiting}</Heading>
                </Box>
                <Box flexGrow="100" m="10px" p="10px" borderWidth="1px" borderRadius="lg">
                    <Heading size="xs">LONGEST WAIT </Heading>
                    <Heading marginTop="inherit" size="2xl"> {dashboardData.longWait}</Heading>
                </Box>
                <Box flexGrow="100" m="10px" p="10px" borderWidth="1px" borderRadius="lg">
                    <Heading size="xs">RESERVED </Heading>
                    <Heading marginTop="inherit" size="2xl"> {dashboardData.reserved}</Heading>
                </Box>
                <Box flexGrow="100" m="10px" p="10px" borderWidth="1px" borderRadius="lg">
                    <Heading as="h1" size="xs" style={{marginBottom: "10px"}}>AGENTS </Heading>
                    <Box d="flex" justifyContent="space-between">
                        <Stack spacing={2}>
                            <h3>Available</h3>
                            <Box d="flex" justifyContent="space-around">
                            <div style={{ color: 'rgb(76, 175, 80)' }}>
                                <IoMdCheckmarkCircle style={{marginTop: "5px"}}/>
                            </div>
                                <span>{dashboardData.agentAvailable}</span> 
                            </Box>
                        </Stack>
                        <Stack spacing={2}>
                            <h3>Unavailable</h3>
                            <Box d="flex" justifyContent="space-around">
                                <div style={{ color: 'rgb(221, 57, 43)' }}>
                                    <IoMdCloseCircle style={{marginTop: "5px"}}/>
                                </div>
                                <span>{dashboardData.agentUnavailable} </span> 
                            </Box>
                        </Stack>
                        <Stack spacing={2}>
                            <h3>Oncall</h3>
                            <Box d="flex" justifyContent="space-around">
                                <div style={{ color: 'rgb(76, 175, 80)' }}>
                                    <IoMdCall style={{marginTop: "5px"}}/>
                                </div>
                                <span>{dashboardData.agentOncall} </span> 
                            </Box>
                        </Stack>
                        <Stack spacing={2}>
                            <h3>Offline</h3>
                            <Box d="flex" justifyContent="space-around">
                                <div style={{ color: 'rgb(96, 100, 113)' }}>
                                    <IoIosRemoveCircle style={{marginTop: "5px"}}/>
                                </div>
                                <span>{dashboardData.agentOffline} </span> 
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Box>
            <div id="dash-queues">
                <Queues queueData={dashboardData.qData} />
            </div>
        </Stack>
    )
}
