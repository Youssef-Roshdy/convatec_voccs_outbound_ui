import React, { useState } from "react";
import {
    Text, Button, Stack, Divider, Spinner,
} from '@chakra-ui/react';
import SkillsModal from "../AgentMonitor/SkillsModal";
import { SERVER_BASE } from '../../constants';

function EditPopUp({worker, handleClose, token}) {
    const [isLoading, setIsLoading] = useState(false)
    const [activeSkills, setActiveSkills] = useState(new Set([...worker.skillsEnabled]))

    function skillsHandler (skillList, workerSid) {
        console.log("skills handler called");
        console.log("Skills: ", skillList)
        const url = `${SERVER_BASE}/skills-handler`;
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                skills_list: [...skillList],
                worker_sid: workerSid,
                Token: token
            })
        };
        console.log("options: ", options)
    
        fetch(url, options)
        .then(response => {
            console.log(response.status)
            setIsLoading(false)
            handleClose()
        });
    }
    return(
        <>
            <div>
                <Text fontSize="lg">{worker.friendlyName} - Skills</Text>
            </div>
            <Text fontSize="md"> Select Skills </Text>  
            <Divider/> 
            <Stack spacing={5}>
                <input type="hidden" name="worker-id" value={worker.sid}/>
                <SkillsModal agent={worker} setActiveSkills={setActiveSkills}/>

                <Button 
                    style={{margin: "10px"}}
                    isLoading = {isLoading}
                    loadingText="Saving"
                    spinner={
                        <Spinner
                            speed="0.40s"
                            emptyColor="gray.300"
                            color="gray.500"
                            size="md"
                        />
                    }
                    onClick={()=> {
                        setIsLoading(true)
                        skillsHandler(activeSkills, worker.sid)
                    }}>Save</Button>
            </Stack>
        </>
    )
}

export default EditPopUp;
