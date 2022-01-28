import StopWatch from '../StopWatch/StopWatch'
import CallButtons from '../CallButtons/CallButtons'
import AvailableButton from '../AvailableButton/AvailableButton'
import CompleteButton from '../CompleteButton/CompleteButton'

function AgentCallOptions({
    agentStatus,
    dial,
    holdTime,
    setHoldTime,
    displayToast,
    transferCalls,
    setTransferCalls,
    token,
    phoneNumber,
    setPhoneNumber
}) {
    return (
        <>
            <CallButtons 
                agentStatus={agentStatus}
                dial={dial} 
                holdTime={holdTime}
                setHoldTime={setHoldTime} 
                displayToast={displayToast}
                transferCalls={transferCalls}
                setTransferCalls={setTransferCalls}
                token={token}
            />
            <AvailableButton 
                agentStatus={agentStatus} 
                dial={dial} 
                phoneNumber={phoneNumber} 
                setPhoneNumber={setPhoneNumber}
            />
            {/* <CompleteButton agentStatus={agentStatus} /> */}
            <div id="agent-wrapup" style={{display: agentStatus === 'WrapUp' ? "block" : "none"}} >
                <StopWatch agentStatus={agentStatus} condition="WrapUp"/>
            </div>
        </>
    );
}

export default AgentCallOptions;
