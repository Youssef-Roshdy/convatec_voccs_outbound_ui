import React from 'react'; 
import {
    HStack,
    Switch,
} from '@chakra-ui/react';

export default function SkillsModal({agent, setActiveSkills}){
    
    const enSkills = agent.skillsEnabled;
    const deSkills = agent.skillsDisabled;
    const enabledSkills = enSkills.map(
        skill => <HStack key={skill +"-"+ agent.sid} spacing={5}>
                    <Switch
                        id="skillsinput" 
                        colorScheme="green" 
                        value={skill} 
                        defaultChecked={true} 
                        onChange={(e) => {
                            if (e.target.checked) {
                                setActiveSkills(prev => new Set([...prev, e.target.value]))
                            } else {
                                setActiveSkills(prev => new Set([...prev].filter(x => x !== e.target.value)))
                            }
                        }}
                    />
                    <label> {skill} </label>
                </HStack>
    )

    const disabledSkills = deSkills.map(
        skill => <HStack key={skill +"-"+ agent.sid} spacing={5}>
                    <Switch
                        colorScheme="green"  
                        id="skillsinput" 
                        value={skill}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setActiveSkills(prev => new Set([...prev, e.target.value]))
                            } else {
                                setActiveSkills(prev => new Set([...prev].filter(x => x !== e.target.value)))
                            }
                        }}
                    />
                    <label> {skill} </label>
                </HStack>
    )

    return [
        <div>
            {enabledSkills}
            {disabledSkills}
        </div>
    ]

}
