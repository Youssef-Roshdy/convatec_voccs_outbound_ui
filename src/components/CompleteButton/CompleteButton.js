import React from 'react';
import { Stack, Button } from '@chakra-ui/react';
import Axios from 'axios';
import { CORE_CRM_URL } from '../../constants';

function AvailableButton({ agentStatus }) {
    function completeTask() {
        let taskSid = document.getElementById('task-sid').value;
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
    return (
        <Stack w="100%" spacing={3} style={{display: agentStatus === 'OnTask' || agentStatus === 'WrapUp' ? "block" : "none"}}>
            <Button w="100%" onClick={completeTask} colorScheme="blue">Complete Task</Button>
        </Stack>
    );
}

export default AvailableButton;
