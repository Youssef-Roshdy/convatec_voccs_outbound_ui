import React, { useState } from 'react';
import {
    Table, Thead, Tbody,
    Tr, Th, Td,
    Heading, Text, SkeletonText,
    Box, HStack, Divider,
    InputGroup, Button, Select
} from "@chakra-ui/react"
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { FaCopy, FaHeadphonesAlt, FaPhoneSlash } from "react-icons/fa";
import './TooltipStyle.css';
import { SERVER_BASE, CORE_CRM_URL } from '../../constants';
import _ from "lodash";
import Axios from 'axios';
import useInterval from 'use-interval'

export default function ActiveTasks({ token, tabIndex }){
    const [filterType, setFilterType] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [filterTypeProp, setFilterTypeProp] = useState('');
    const [renderTable, setRenderTable] = useState(true);
    const [sort, setSort] = useState({
        "type": '',
        "by": ''
    });
    const [tasksData, setTasksData] = useState(
        {
            "data": [
                {
                    "sid": "WTb4e9869a213382a8973322a7741fe71e",
                    "priority": 2,
                    "channel": "voice",
                    "queue": "Covid19_Vaccine_Consumer",
                    "status": "reserved",
                    "age": 616,
                    "worker": {},
                    "attributes": '{"name":"John", "age":30, "city":"New York"}',
                },
                {
                    "sid": "WTb4e9869a213382a8973322a7741fe71e",
                    "priority": 2,
                    "channel": "voice",
                    "queue": "Covid19_Vaccine_Consumer",
                    "status": "assigned",
                    "age": 616,
                    "worker": {},
                    "attributes": '{"name":"John", "age":30, "city":"New York"}',
                },
                {
                    "sid": "test",
                    "priority": 0,
                    "channel": "voice",
                    "queue": "First_Connect_Training",
                    "status": "wrapping",
                    "age": 3126,
                    "worker": {},
                    "attributes": '{"name":"John", "age":30, "city":"New York"}',
                },
                {
                    "sid": "WTb4e9869a213382a8973322a7741fe71e",
                    "priority": 2,
                    "channel": "voice",
                    "queue": "Covid19_Vaccine_Consumer",
                    "status": "completed",
                    "age": 616,
                    "worker": {},
                    "attributes": '{"name":"John", "age":30, "city":"New York"}',
                },
                {
                    "sid": "WTb4e9869a213382a8973322a7741fe71e",
                    "priority": 4,
                    "channel": "voice",
                    "queue": "Covid19_Vaccine_Consumer",
                    "status": "canceled",
                    "age": 616,
                    "worker": {},
                    "attributes": '{"name":"John", "age":30, "city":"New York"}',
                },
            ]
        }
    );

    const dropDownProps = {
        status: [
            "reserved",
            "assigned",
            "wrapping",
            "completed",
            "canceled",
            "pending"

        ],
        queue: [
            "Covid19_Vaccine_Test",
            "Covid19_Vaccine_Hcp",
            "First_Connect",
            "First_Connect_Training",
            "Covid19_Vaccine_Consumer",
            "Escalations"
        ],
        channel: ["voice", "chat"],
        priority: ["0","1","2","3","4","5","6"]
    }

    let currentTasksArray = tasksData.data;
    
    if (filterType !== '') {
        currentTasksArray = currentTasksArray.filter(task => task[filterType] === filterTypeProp);
    }
    // Sort Time in Status
    if (sort.type !== '') {
        currentTasksArray = _.sortBy(currentTasksArray, [sort.by]); 
        if (sort.type === 'desc') {
            currentTasksArray.reverse()
        }
    }
    // Listen to Recording
    function monitorCall(taskSid) {
        console.log('starting monitor for task id ', taskSid);
        var params = {
          taskSid: taskSid,
        };
        if (window.TwilioDevice) {
            console.log("I'm AMAMAMA...")
            console.log("Twilio Device...", window.TwilioDevice)
          var monitorConnection = window.TwilioDevice.connect(params);
          monitorConnection.on('connect', function () {
            console.log('Monitor connected...');
            setIsListening(true)
          });
        }
    }
    // console.log("Twilio Device...", window.TwilioDevice)
    document.querySelectorAll('.listenToRecording-button').forEach(function(button) {
        button.onclick = function() {
            console.log("Button clicked")
            if(this.getAttribute("aria-label") === 'active') {
                // console.log("att: ", this.getAttribute("conferenceSid"))
                let taskSid = this.getAttribute("taskSid");
                if (taskSid) {
                    console.log("EE: ", taskSid)
                    monitorCall(taskSid)
                }
            } else {
                window.TwilioDevice.disconnectAll();
            }      
        } 
    });

    useInterval(() => {
        if (tabIndex === 3) {
            Axios.get(`${SERVER_BASE}/active-tasks?Token=${token}`).then((response) => {
                setTasksData(response.data);
            });
        }
    }, 3000)
        
    function calcAge(time) {
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;

        var res = "";
        if (hrs > 0) {
            res += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        res += "" + mins + ":" + (secs < 10 ? "0" : "");
        res += "" + secs;
        return res;
    }

    function completeTask(taskSid) {
        const params = new URLSearchParams()
        params.append('taskSid', taskSid)
        console.log("Task SID: ", taskSid);
        Axios.post(`${CORE_CRM_URL}overrideCompleteCase`, params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(res => console.log(res))
        .catch(err => console.log("POST ERR: ", err))
    }

    function copyTask(i, task) {
        var textArea = document.createElement("textarea");
        textArea.value = `
            SID: ${task.sid} \n
            PRIORITY: ${task.priority} \n
            CHANNEL: ${task.channel} \n
            QUEUE: ${task.queue} \n
            STATUS: ${task.status} \n
            DURATION: ${calcAge(task.age)} \n
        `;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.style.display = 'none'
        var tooltip = document.getElementById("myTooltip" + i);
        tooltip.innerHTML = "Copied!";
    }
      
    function changeTooltip(i) {
        var tooltip = document.getElementById("myTooltip" + i);
        tooltip.innerHTML = "Copy to clipboard";
    } 

    function handleRenderTable() {
        setTimeout(() => {
            setRenderTable(false);    
        }, 1000)
    }

    function handleDisplayData() {
        if (document.getElementById("no-tasks-data")) {
            if (currentTasks.length < 1) {
                document.getElementById("no-tasks-data").style.display = "block";
            } else if(renderTable) {
                document.getElementById("no-tasks-data").style.display = "none";
                return loadingSkeleton
            } else {
                document.getElementById("no-tasks-data").style.display = "none";
                return currentTasks
            }
        }
    }
    
    function addSelectOption(type) {
        if(type !== '') {
            const res = dropDownProps[type].map(element => 
                <option value={element}>{element.toUpperCase()}</option>
            );
            return res;
        }
    }

    const currentTasks = currentTasksArray.map((task, i) => 
        <Tr key={"On_Tr-"+i}>
            <Th key={"On_Th1-"+i}>{task.sid}</Th>
            <Th key={"On_Th2-"+i} textAlign="center">{task.priority}</Th>
            <Th key={"On_Th3-"+i} textAlign="center">{task.channel}</Th>
            <Th key={"On_Th4-"+i} textAlign="center">{task.queue}</Th>
            <Th 
                key={"On_Th5-"+i} 
                textAlign="center"
                color = {
                    task.status === 'assigned' ? "blue.500" 
                    : task.status === 'wrapping' ? "orange" 
                    : task.status === 'completed' ? "green.500" 
                    : "red"
                }
            >
                {task.status}
            </Th>
            <Th key={"On_Th6-"+i} textAlign="center">{calcAge(task.age)}</Th> 
            <Th key={"On_Th7-"+i} textAlign="center">
                <div class="tooltip">
                    <Button onClick={() => copyTask(i, task)} onMouseOut={() => changeTooltip(i)}>
                        <span class="tooltiptext" id={"myTooltip" + i}>Copy to clipboard</span>
                        <FaCopy/>
                    </Button>
                </div>
            </Th> 
            <Th key={"On_Th8-"+i} textAlign="center">
                <div class="tooltip">
                    {
                        task.status === 'assigned' 
                        ? 
                            <Button 
                                className="listenToRecording-button" 
                                onClick={() => {
                                    console.log("TASK: ", task.sid)
                                }} 
                                onMouseOut={() => changeTooltip(i)}
                                aria-label={isListening ? "notActive" : "active"}
                                taskSid={task.sid}
                            >
                                <span class="tooltiptext" id={"myTooltip" + i}>{isListening ? "Leave call" : "Listen to live call"}</span>
                                {isListening ? <FaPhoneSlash/> : <FaHeadphonesAlt/>}
                            </Button>
                        :
                            <Button 
                                className="listenToRecording-button" 
                                isDisabled={true} 
                                onClick={() => console.log("Listen To Live Call")} onMouseOut={() => changeTooltip(i)}>
                                <span class="tooltiptext" id={"myTooltip" + i}>Can't Listen to this call</span>
                                <FaPhoneSlash/>
                            </Button>
                    }
                </div>
            </Th> 
            <Th key={"On_Th9-"+i} textAlign="center">
                <Button onClick={() => completeTask(task.sid)}>
                    Complete Task
                </Button>
            </Th> 
        </Tr>
        )

    const loadingSkeleton =  
        <Tr>
            <Th key="On_Th1"><SkeletonText mt="3" noOfLines={3} spacing="3"/></Th>
            <Td key="On_Td1"><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
            <Td key="On_Td2"><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
            <Td key="On_Td3"><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
            <Td key="On_Td4"><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
            <Td key="On_Td5"><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
            <Td key="On_Td6"><SkeletonText mt="3" noOfLines={3} spacing="3"/>
                <Button isLoading={true}></Button>
            </Td>
            <Td key="On_Td7"><SkeletonText mt="3" noOfLines={3} spacing="3"/>
                <Button isLoading={true}></Button>
            </Td>
            <Td key="On_Td8"><SkeletonText mt="3" noOfLines={3} spacing="3"/>
                <Button isLoading={true}></Button>
            </Td>
        </Tr>
    
    return [
        <div id="activeTasks-container">
            <Box d="flex" flexDir="column" alignItems="center">
                <Heading as="h1" size="md" textAlign="center">VOCCS AGENT ACTIVE TASKS</Heading>
                <div style={{width: "50%"}}>
                    <InputGroup m="15px">
                        <Select 
                            id="tasksFilter"
                            w="30%" 
                            style={{ marginLeft: "10px"}}
                            value={filterType} 
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                if (e.target.value !== 'All') {
                                    setFilterTypeProp(dropDownProps[e.target.value][0])
                                }
                            }}
                            placeholder="All"
                        > 
                            <option key="status" value="status">Status</option>
                            <option key="queue" value="queue">Queue</option>
                            <option key="channel" value="channel">Channel</option>
                            <option key="priority" value="priority">Priority</option>
                        </Select>
                        <Select 
                            id="tasksFilter"
                            style={{ marginLeft: "10px"}}
                            onChange={(e) => setFilterTypeProp(e.target.value)}
                        > 
                            {addSelectOption(filterType)}
                        </Select>
                    </InputGroup>
                </div>
            </Box>
            <div id="main-header"></div>
            <Divider />
            <Table variant="striped" colorScheme="blue.600" size="sm">
                <Thead>
                    <Tr>
                        <Th>SID</Th>
                        <Th textAlign="center">
                            <HStack d="flex" justifyContent="center" textAlign="center">
                                <Text>PRIORITY</Text>
                                <AiFillCaretDown color={sort.type === 'desc'&& sort.by === "priority"  ? 'green' : ''} onClick={()=> setSort({type: 'desc', by: "priority"})}/>
                                <AiFillCaretUp color={sort.type === 'asc' && sort.by === "priority" ? 'green' : ''} onClick={()=> setSort({type: 'asc', by: "priority"})}/>
                            </HStack>
                        </Th>
                        <Th textAlign="center">
                            <HStack d="flex" justifyContent="center" textAlign="center">
                                <Text>CHANNEL</Text>
                                <AiFillCaretDown color={sort.type === 'desc'&& sort.by === "channel"  ? 'green' : ''} onClick={()=> setSort({type: 'desc', by: "channel"})}/>
                                <AiFillCaretUp color={sort.type === 'asc' && sort.by === "channel" ? 'green' : ''} onClick={()=> setSort({type: 'asc', by: "channel"})}/>
                            </HStack>
                        </Th>
                        <Th textAlign="center">
                            <HStack d="flex" justifyContent="center" textAlign="center">
                                <Text>QUEUE</Text>
                                <AiFillCaretDown color={sort.type === 'desc'&& sort.by === "queue"  ? 'green' : ''} onClick={()=> setSort({type: 'desc', by: "queue"})}/>
                                <AiFillCaretUp color={sort.type === 'asc' && sort.by === "queue" ? 'green' : ''} onClick={()=> setSort({type: 'asc', by: "queue"})}/>
                            </HStack>
                        </Th>
                        <Th textAlign="center">
                            <HStack d="flex" justifyContent="center" textAlign="center">
                                <Text>STATUS</Text>
                                <AiFillCaretDown color={sort.type === 'desc'&& sort.by === "status"  ? 'green' : ''} onClick={()=> setSort({type: 'desc', by: "status"})}/>
                                <AiFillCaretUp color={sort.type === 'asc' && sort.by === "status" ? 'green' : ''} onClick={()=> setSort({type: 'asc', by: "status"})}/>
                            </HStack>
                        </Th>
                        <Th textAlign="center">
                            <HStack d="flex" justifyContent="center" textAlign="center">
                                <Text>DURATION</Text>
                                <AiFillCaretDown color={sort.type === 'desc'&& sort.by === "age"  ? 'green' : ''} onClick={()=> setSort({type: 'desc', by: "age"})}/>
                                <AiFillCaretUp color={sort.type === 'asc' && sort.by === "age" ? 'green' : ''} onClick={()=> setSort({type: 'asc', by: "age"})}/>
                            </HStack>
                        </Th>
                        <Th textAlign="center">
                            COPY TASK
                        </Th>
                        <Th textAlign="center">
                            Listen
                        </Th>
                        <Th textAlign="center">
                            COMPLETE TASK
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        handleRenderTable()
                    }
                    {
                        handleDisplayData()
                    }
                </Tbody>
            </Table>
            <div id="no-tasks-data" style={{display: 'none', padding: "10px"}}>
                <Heading size="md" textAlign='center'>There are no matching data</Heading>
            </div>
        </div>
    ]
}
