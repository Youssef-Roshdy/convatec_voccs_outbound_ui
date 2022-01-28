import React, { useState, useEffect } from 'react';
import { 
    HStack, Stack,
    IconButton, Icon,
    Tooltip, Progress,
    Select, Button, Input, Text,
} from '@chakra-ui/react';
import { 
    FaPause, FaPlay,
    FaPhoneSlash, FaRegPaperPlane,
    FaMicrophoneSlash, FaMicrophone,
    FaGripVertical
} from "react-icons/fa";
import Axios from 'axios';
import { SERVER_BASE } from '../../constants';
import useInterval from 'use-interval';
import Dialer from '../Dialer/Dialer'
import StopWatch from '../StopWatch/StopWatch'
import { removeConferenceParticipant, conferenceParticipantHold } from './CallButtonUtils'

function CallButtons({
    agentStatus,
    dial,
    holdTime ,
    setHoldTime,
    displayToast,
    transferCalls,
    setTransferCalls,
    token
}) {
    const dropDownNumbers = {
        "custom": "custom",
        "Escalation Queue": "+13124772806",
        "Covid-19-Drug Safety 866-303-1004": "+18663031004",
        "Medical Information (PMI) 888-273-7017": "+18882737017",
        "Consumer Fact Sheet Recording": "+17035952843",
        "HCP Fact Sheet Recording": "+17036888030",
        "Covax CSAT 703-783-9477": "+17037839477",
        "Translation Line (Accutrans)": "+18558652224",
        "Pfizer Trade/Customer Service 833-391-2033": "+18333912033",
        "RxPathways 833-668-3564": "+18336683564",
        "RxPathways (Lyrica) 818-661-1148": "+18186611148",
        "Accounts Payable 800-601-1357": "+18006011357",
        "Animal Health/Zoetis 888-963-8471": "+18889638471",
        "Chantix (CIB) 800-984-9647": "+18009849647",
        "Chantix SC Help Desk for Pharmacy 866-673-3037": "+18666733037",
        "Clinical Trials Hotline 800-718-1021": "+18007181021",
        "Cologuard (CIB & HCP) 844-870-8870": "+18448708870",
        "Eliquis BMS-AE, PCOM, MI (HCP) 919-666-9288": "+19196669288",
        "Eliquis BMS-AE, PCOM, MI (Consumers) 919-666-9208": "+19196669208",
        "Eliquis BMS-Patient Assistance 800-736-0003": "+18007360003",
        "Eliquis Consumer (LASH) 704-944-5264": "+17049445264",
        "Eliquis HCP (LASH) 704-944-5265": "+17049445265",
        "Eliquis Sales & Distribution 800-631-5244": "+18006315244",
        "HR Source (Pfizer Corporate HR) 866-476-8723": "+18664768723",
        "Lipitor SC Help Desk-Live Op 855-496-8792": "+18554968792",
        "Lyrica Active Savings Card 800-578-7076": "+18005787076",
        "Lyrica for Pharmacy Savings Card Help 877-822-7889": "+18778227889",
        "Nicotrol Mouth Pieces 800-222-7200": "+18002227200",
        "OTC-Customer (Thermacare Only) 800-323-3383": "+18003233383",
        "OTC-HCP Sample Line (Thermacare Only) 888-278-6528": "+18882786528",
        "OTC-All Others (Now to GSK) 800-245-1040": "+18002451040",
        "Pfizer Corporate Office/Switchboard 212-733-2323": "+12127332323",
        "Pfizer First Connect (CIB) 800-879-3477": "+18008793477",
        "Pfizer PRO (IBCC) 800-505-4426": "+18005054426",
        "Pfizer Sales Rep (Help Desk) 877-733-4357": "+18777334357",
        "Pfizer Shareholder Services 800-733-9393": "+18007339393",
        "Sales & Distribution/Pfizer Memphis/Customer Service 800-533-4535": "+18005334535",
        "Speakers-1099 Issues 855-353-5976": "+18553535976",
        "Speakers-Allied Health Media (AHM) 800-800-4637": "+18008004637",
        "Speakers-Operations/Sales & Marketing 212-573-2271": "+12125732271",
        "Speaker-Planning: Accts Payable/W-9 901-215-1111": "+19012151111",
        "Status of Rx Refunds (CIB) 866-708-8796": "+18667088796",
        "Vaccines 800-666-7248": "+18006667248",
    }

    const [dropDownQueues, setDropDownQueues] = useState({
        "Everyone": "WQ65ed412d16fe9972453414bb17e28ba5",
        "COVID19_VACCINE_HCP": "WQe58cb12f5413bbdaa75335672e05f4a5",
    })

    function addSelectOption(type) {
        if(type !== '') {
            let res = []
            if (type === 'queues') {
                for (const key in dropDownQueues) {
                    if (Object.hasOwnProperty.call(dropDownQueues, key)) {
                        res.push(<option value={dropDownQueues[key]}>{key}</option>)
                    }
                }
            } else {
                for (const key in dropDownNumbers) {
                    if (Object.hasOwnProperty.call(dropDownNumbers, key)) {
                        res.push(<option value={dropDownNumbers[key]}>{key}</option>)
                    }
                }
            }
            return res
        }
    }
    const resetAll = () => {
        console.log("ResetAll!!")
        setIsMute(false);
        setIsHold(false);
        setIsDialPad(false)
        // restTransfer()
        setTransferCalls([])
        setTransferValue('custom')
        setOnTransfer(false);
        document.getElementById("dialer-input").value= '';
        document.getElementById("dialer-input").placeholder="0000-0000";
        document.getElementById("dialer-container").style.transform= 'translateY(30)';
        document.getElementById("dialer-container").style.opacity = 0;
    }
    const restTransfer = (callDetails) => {
        let newTransferCalls = transferCalls.filter( call => 
            call.number !== callDetails.number 
        )
        console.log("In Hangup: ",newTransferCalls)
        setTransferCalls(newTransferCalls)
    }

    const [isMute, setIsMute] = useState(false);
    const toggleMute = () => {
        setIsMute(!isMute);
    }
    
    const [isHold, setIsHold] = useState(false);
    const toggleHold = () => {
        setIsHold(!isHold);
    }
    
    const toggleTransferHold = (index) => {
        let updateTransferCalls = [...transferCalls]; 
        updateTransferCalls[index].hold = !updateTransferCalls[index].hold
        console.log("updateTransferHold: ", updateTransferCalls)
        setTransferCalls(updateTransferCalls)
    }
    
    const [onTransfer, setOnTransfer] = useState(false);
    const toggleTransfer = () => {
        setOnTransfer(!onTransfer);
    }

    const [transferValue, setTransferValue] = useState('');

    const [transferType, setTransferType] = useState('numbers')

    const [isDialPad, setIsDialPad] = useState(false);
    const toggleDialPad = () => {
        setIsDialPad(!isDialPad);
        if (!isDialPad) {
            document.getElementById("dialer-container").style.display = 'block';
            document.getElementById("dialer-container").style.opacity = 1;
            document.getElementById("dialer-container").style.transform= 'translateY(0)';         
        } else {
            document.getElementById("dialer-container").style.transform= 'translateY(30)';
            document.getElementById("dialer-container").style.opacity = 0;
            document.getElementById("dialer-container").style.display = 'none';
        }
    }

    const checkIfMuted = () => {
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(stream => {
            if (stream.getAudioTracks()[0].muted) {
                setIsMute(stream.getAudioTracks()[0].muted)
                console.log("Toast in CallButton")
                displayToast("You are muted", "Please be aware that the caller won't be able to hear your voice", "error")
            }
        })
        .catch(err => console.log(err));
    }

    useEffect(() => {
        Axios.get(`${SERVER_BASE}/task-queues?Token=${token}`).then((response) => {
            console.log("Task Queues: ", response.data)
            setDropDownQueues(response.data);
        })
        .catch(console.error)
        checkIfMuted()
    }, [])
    useEffect(() => {
        resetAll() 
    }, [agentStatus]);
    const [callTimeCounter, setCallTimeCounter] = useState(0)
    useInterval(() => {
        if(isHold) {
            setHoldTime(holdTime + 1)
        }
        setCallTimeCounter(callTimeCounter + 1)
    }, 1000)
    return (
        <Stack style={{display: agentStatus === 'OnCall' ? "block" : "none"}}>
            <HStack spacing={onTransfer ? "auto" : 3}>
                <p style={{display: "none"}} id="holdCounter">{holdTime}</p>
                <p style={{display: "none"}} id="callTimeCounter">{callTimeCounter}</p>
                <Tooltip label="Hangup Call">
                    <IconButton
                        id="button-hangup"
                        colorScheme="blue"
                        aria-label="hangup"
                        size="lg"
                        borderRadius="50%"
                        onClick={resetAll}
                        icon={<Icon as={FaPhoneSlash} />}
                    />
                </Tooltip>
                <Tooltip label={isMute ? "Unmute" : "Mute"}>
                    <IconButton
                        id="button-mute"
                        colorScheme={isMute ? "red" : "blue"}
                        aria-label={isMute ? "Unmute" : "Mute"}
                        size="lg"
                        borderRadius="50%"
                        icon={<Icon as={isMute ? FaMicrophoneSlash : FaMicrophone} />}
                        onClick={toggleMute}
                    />
                </Tooltip>
                <Tooltip label={isHold ? "Play Call - " + holdTime + "s" : "Hold Call - " + holdTime + "s"}>
                    <IconButton
                        id={isHold ? "button-hold-active" : "button-hold"}
                        colorScheme={isHold ? "yellow" : "blue"}
                        aria-label={isHold ? "Play Call" : "Hold Call"}
                        size="lg"
                        borderRadius="50%"
                        icon={<Icon as={isHold ? FaPlay : FaPause} />}
                        onClick={toggleHold}
                    />
                </Tooltip>
                <Tooltip label="Transfer Call">
                    <IconButton
                        id="button-transfer"
                        colorScheme={onTransfer ? "teal" : "blue"}
                        aria-label="Transfer Call"
                        size="lg"
                        borderRadius="50%"
                        onClick={toggleTransfer}
                        icon={<Icon as={FaRegPaperPlane} />}
                    />
                </Tooltip>
                <Tooltip label="DialPad">
                    <IconButton
                        id="button-dialpad"
                        colorScheme={isDialPad ? "green" : "blue"}
                        aria-label="DialPad"
                        size="lg"
                        borderRadius="50%"
                        onClick={toggleDialPad}
                        icon={<Icon as={FaGripVertical} />}
                    />
                </Tooltip>
            </HStack>
            
            <StopWatch agentStatus={agentStatus} condition="OnCall"/>
            <Dialer />
            
            <Stack id="call-transfer" spacing={3} display={onTransfer ? "block" : "none"}>
                <Stack>
                    <Input type="hidden" id="worker-sid"/>
                    <Input type="hidden" id="task-sid"/>
                    <Input type="hidden" id="reservation-sid"/>
                    <Input type="hidden" id="call-sid"/>
                    <Input type="hidden" id="case-id"/>
                    <Input type="hidden" id="conference-sid"/>
                    <p style={{display: "none"}} id="transfer-conference"></p>
                    <p style={{display: "none"}} id="transfer-participant"></p>
                    <Select 
                        id="transfer-type-select" 
                        name="transfer-type-select" 
                        maxWidth="30vw"
                        value={transferType} 
                        onChange={(e) => {
                            setTransferType(e.target.value)
                            if (e.target.value === 'numbers') {
                                setTransferValue('custom')
                            }
                        }}
                    >
                        <option value="numbers">Transfer to Numbers</option>
                        <option value="queues">Transfer to Queues</option>
                    </Select>
                    <Input 
                        id="transfer-text"
                        type="text" 
                        name="transfer-text" 
                        style={{display: transferValue === 'custom' && transferType === 'numbers'  ?  "block" : "none"}}
                    />
                    <Select 
                        id="transfer-select" 
                        name="transfer-select"
                        maxWidth="30vw"
                        value={transferValue} 
                        onChange={(e) => {
                            setTransferValue(e.target.value)
                        }}
                    > 
                        {addSelectOption(transferType)}
                    </Select>
                    <Button id="transfer-dial" colorScheme="blue">Connect</Button>
                </Stack>
                <HStack id="transferoncall-buttons" spacing={3} style={{display: "none"}}>
                    {transferCalls.map((call, index) => {
                        if (index !== 0) {
                        return (
                        <>
                            <Text id={`transfer-status-${call.number}`}>{call.status}</Text>
                            <Tooltip label={call.hold ? "Play Call" : "Hold Call"}>
                                <IconButton
                                    id={`transfer-hold-${call.number}`}
                                    colorScheme={call.hold ? "yellow" : "blue"}
                                    aria-label={call.hold ? "transfer-holdactive" : "transfer-hold"}
                                    participantSid={call.participantSid}
                                    size="lg"
                                    borderRadius="50%"
                                    icon={<Icon as={call.hold ? FaPlay : FaPause} />}
                                    onClick={() => {
                                        conferenceParticipantHold(call, index, token, toggleTransferHold)
                                    }}
                                />
                            </Tooltip>
                            <Tooltip label="Transfer EndCall">
                                <IconButton
                                    id={`transfer-endcall-${call.number}`}
                                    colorScheme="blue"
                                    aria-label="Transfer EndCall"
                                    participantSid={call.participantSid}
                                    size="lg"
                                    borderRadius="50%"
                                    icon={<Icon as={FaPhoneSlash} />}
                                    onClick={() => {
                                        removeConferenceParticipant(call, token, restTransfer)
                                    }}
                                />
                            </Tooltip>
                        </>);
                        }
                    })}
                </HStack>
            </Stack>
            <Progress style={{display: dial ? "block" : "none"}} size="xs" isIndeterminate />
        </Stack>
    );
}

export default CallButtons;
