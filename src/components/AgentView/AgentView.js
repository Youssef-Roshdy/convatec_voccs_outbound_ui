import React, { useState, useEffect } from 'react';
import {
    VStack, HStack,
    Heading, Text,
    Select, useToast,
    Button, Avatar,
    Center,
} from '@chakra-ui/react';
import { SERVER_BASE } from '../../constants';
import { MdCall, MdCallEnd } from "react-icons/md"
import Axios from 'axios';
import './AgentView.css'
import useInterval from 'use-interval'
import ConnectToTwilio from '../../utils/utils'
import { fetchWorkerSid } from '../../utils/fetchWorker';
import AgentCallOptions from '../AgentCallOptions/AgentCallOptions';
export default function AgentView({ 
    screenMode,
    setWorkerRole,
    agentStatus,
    setAgentStatus,
    token,
    setToken
}) 
{
    const [workerIdentity, setWorkerIdentity] = useState({
        "name": "Agent Name",
        "email": "agent@notset", 
        "image": ""
    });
    const [transferCalls, setTransferCalls] = useState([])
    const [timeInStatus, setTimeInStatus] = useState({
        hour: 0,
        min: 0,
        sec: 0
    })
    const [holdTime, setHoldTime] = useState(0)
    const toast = useToast()
    const [dial, setDial] = useState(false);
    const toggleDial = (dialValue) => {
        setDial(dialValue);
    }  
    const [phoneNumber, setPhoneNumber] = useState('');
    const displayToast = (title, description, status) => {
        toast({
            title: title,
            description: description,
            status: status,
            duration: 6000,
            isClosable: true,
            position: "top-left",
        })
    }

    function getTimeInStatus(email, token) {
        // I use setTimeout because there is a useEffect that run if the agentStatus changed 
        // and it reset the timer to zeros so I have to wait until I get the current agentStatus 
        // Then update the TimeInStatus
        // There is absolutely a better way I should change it in the future
        setTimeout(() => {
            Axios.get(`${SERVER_BASE}/agent-data?Token=${token}`).then((response) => {
                let agentsData = response.data.wkdata;
                const foundOnline = agentsData.online.find(agent => agent.friendlyName.toLowerCase() === email.toLowerCase());
                const foundOffline = agentsData.offline.find(agent => agent.friendlyName.toLowerCase() === email.toLowerCase());
                if (foundOnline !== undefined) {
                    let res = foundOnline.timeInStatus.split(":");
                    setTimeInStatus({
                        hour: parseInt(res[0]),
                        min: parseInt(res[1]),
                        sec: parseInt(res[2])
                    })
                    
                } else if (foundOffline !== undefined) {
                    let res = foundOffline.timeInStatus.split(":");
                    setTimeInStatus({
                        hour: parseInt(res[0]),
                        min: parseInt(res[1]),
                        sec: parseInt(res[2])
                    })
                }
            });
        }, 3000);
    }

    function getAgentRole(email) {
        Axios.get('/api/get-role', {
            params: {
                email: email
            }
          })
        .then((res) => {
            setWorkerRole(res.data.role)
        })
        .catch(err => console.log("Error: ", err))
    }

    function getAgentImage(userId, name, email) {
        Axios.get(`https://content-people.googleapis.com/v1/people/${userId}?personFields=photos&key=AIzaSyC52yRf4_MTFoH9vgFWpS67fUN09r3w8gQ`)
        .then(res => {
            setWorkerIdentity({
                name: name,
                email: email, 
                image: res.data.photos[0].url
            })
        })
        .catch(err => {
            console.log("Error I can't find user photo: ", err)
            setWorkerIdentity({
            name: name,
            email: email, 
            image: ''
            })
        })
    }
    
    useInterval(() => {
        if (timeInStatus.sec === 59){
            if (timeInStatus.min === 59) {
                setTimeInStatus({
                    hour: timeInStatus.hour + 1,
                    min: 0,
                    sec: 0
                })
            } else {
                setTimeInStatus({
                    hour: timeInStatus.hour,
                    min: timeInStatus.min + 1,
                    sec: 0
                })
            }
        }
        else {
            setTimeInStatus({
                hour: timeInStatus.hour,
                min: timeInStatus.min,
                sec: timeInStatus.sec + 1
            })
        }
    }, 1000)

    useEffect(() => {
        setTimeInStatus({
            hour: 0,
            min: 0,
            sec: 0
        })
    }, [agentStatus])

    useEffect(() => {
        console.log("useEffect transferCalls: ", transferCalls)
    }, [transferCalls])

    useEffect(() => {
        Axios.post("/api/get-email")
        .then((res) => {
            var email = res.data.email;
            // Customizing User Name
            var name = res.data.email.split("@")[0];
            name = name.replace('.', ' ')
            var first = name.split(' ')[0]
            first = first.charAt(0).toUpperCase() + first.slice(1);
            var second = name.split(' ')[1]
            second = second.charAt(0).toUpperCase() + second.slice(1)
            name = first + " " + second
            // End Of customizing User Name
            var userId = res.data.sub.split(":")[1]
            // Get Agent Image
            getAgentImage(userId, name, email)
            fetch(SERVER_BASE + '/voice-token?email=' + email)
            .then(res => res.json())
            .then(json => {
                console.log("Token: ", json.token)
                setToken(json.token);
                fetchWorkerSid(
                    json.token,
                    email,
                    setAgentStatus,
                    displayToast,
                    setPhoneNumber,
                    transferCalls
                );

                ConnectToTwilio(
                    json.token,
                    displayToast,
                    toggleDial,
                    transferCalls,
                    setTransferCalls,
                    setAgentStatus,
                    setHoldTime
                );
                // Update Time in status
                getTimeInStatus(email.split("@")[0], json.token);
                // Get Agent role
                getAgentRole(email)
            });
            
        });
        
    }, []);

    return [
        <VStack spacing={3} minHeight="100%" bg={screenMode === 'dark' ? "#eff0f1" : "blue.600"} textAlign='center'>
            <Heading size="sm" m={5}>VCloud Omnichannel Contact Center System - VOCCS </Heading>
            <Center>
                <Text id="log"></Text>
                <VStack>
                    <Avatar 
                        id="userImage"
                        size="2xl" 
                        className={ agentStatus === "Available" ? "userImage" : "" }
                        style={ agentStatus === "Available" ? {border: "2px solid #31A24C", boxShadow: "4px 3px 12px #31A24C"} : {border: "2px solid gray", boxShadow: "4px 3px 12px grey"}} 
                        name={workerIdentity.name}
                        src={workerIdentity.image}
                    />
                    <Heading size={4} color="blackAlpha">{workerIdentity.name}</Heading>
                    <Heading size="xs" color="blackAlpha">
                    {"Time in status: "}{timeInStatus.hour < 10 ? "0"+timeInStatus.hour : timeInStatus.hour }:{timeInStatus.min < 10 ? "0"+timeInStatus.min : timeInStatus.min}:{timeInStatus.sec < 10 ? "0"+timeInStatus.sec : timeInStatus.sec}
                    </Heading>
                    <Select 
                        id="availableselectchange"
                        variant="filled"
                        value={agentStatus} 
                        // onChange={handleChange}
                        style={{ textAlignLast: 'center'}}
                    >
                    {
                        agentStatus === 'OnTask'
                        ? <option style={{display:'none'}} value="OnTask">OnTask</option>
                        :
                        <>
                        <option value="Offline">Offline</option>
                        <option style={{display:'none'}} value="Unavailable/Missed">Unavailable/Missed</option>
                        <option value="Available">Available</option>
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
                    
                    <input type="hidden" id="worker-identity" value={workerIdentity.email} />
                    
                    <AgentCallOptions 
                        agentStatus={agentStatus} 
                        dial={dial}
                        holdTime={holdTime}
                        setHoldTime={setHoldTime}
                        displayToast={displayToast}
                        transferCalls={transferCalls}
                        setTransferCalls={setTransferCalls}
                        token={token}
                        phoneNumber={phoneNumber} 
                        setPhoneNumber={setPhoneNumber}
                    />

                    <div id='caller-details' style={{display: 'none'}}>
                        <Heading as="h4" id='incoming-queue' size="md" ></Heading>
                        <Heading as="h4" id='incoming-details' size="md"></Heading>
                    </div>

                    <HStack id="accept-call" style={{display: "none"}} spacing={3}>
                        <Button id="call-accept" rightIcon={<MdCall />} bg="green.500" colorScheme="green">Accept</Button>
                        <Button id="call-reject" rightIcon={<MdCallEnd />} bg="red.500" colorScheme="red">Reject</Button>
                    </HStack>
                </VStack>
            </Center>
        </VStack>
    ]
}
