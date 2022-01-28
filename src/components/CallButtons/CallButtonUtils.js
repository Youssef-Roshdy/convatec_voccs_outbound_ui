import { SERVER_BASE } from '../../constants'

export function removeConferenceParticipant (callDetails, token, restTransfer) {
    console.log('remove conference participant called');
    const conferenceSid =  document.getElementById('transfer-conference').innerText;
    const url = SERVER_BASE + '/conference-remove';
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
            conference_sid: conferenceSid,
            participant_sid: callDetails.participantSid,
            Token: token
        })
    };
    fetch(url, options)
    .then(response => {
        console.log(response.status);
        if(response.status === 200){
            console.log(response.status);
            restTransfer(callDetails)
        }
    })
    .catch(err => console.error(err))
}

export function conferenceParticipantHold (callDetails, index, token ,toggleTransferHold) {
    // todo server url var
    console.log('Conference Hold Called');
    const conferenceSid =  document.getElementById('transfer-conference').innerText;
    console.log("conferenceSid: ", conferenceSid);
    const url = SERVER_BASE + '/conference-hold';
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
            conference_sid: document.getElementById('transfer-conference').innerText,
            participant_sid: callDetails.participantSid,
            hold_action: !callDetails.hold,
            Token: token
        })
    };

    fetch(url, options)
    .then(response => {
        console.log(response.status)
        toggleTransferHold(index)
    })
    .catch(err => console.error(err))
}

