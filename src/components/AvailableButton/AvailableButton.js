import React, { useState } from 'react';
import { 
    Input, InputGroup, InputLeftElement,
    Icon, Stack, Button, Progress, 
} from '@chakra-ui/react';
import { FaPhone } from "react-icons/fa";

function AvailableButton({agentStatus, dial, phoneNumber, setPhoneNumber}) {
    const [makeACall, setMakeACall] = useState(false);

    const toggleMakeACall = () => {
        setMakeACall(!makeACall);
    }
    
    const updatePhoneNumber = (e) => {
        setPhoneNumber(e.target.value);
    }
    return (
        <Stack w="100%" spacing={3} style={{display: agentStatus === 'OnTask' ? "block" : "none"}}>
            <Button w="100%" onClick={toggleMakeACall} colorScheme="blue">Make a Call</Button>
            <Stack spacing={3} style={{display: makeACall ? "" : "none"}}>
                <InputGroup>
                    <InputLeftElement
                    pointerEvents="none"
                    children={<Icon as={FaPhone} color="gray.300" />}
                    />
                    <Input 
                        id="phone-number" 
                        type="tel" 
                        placeholder="Phone number" 
                        value={phoneNumber} 
                        onChange={updatePhoneNumber}
                    />
                </InputGroup>
                <Button 
                    id="button-call"
                    colorScheme="blue"
                >
                    Dial
                </Button>
                <Progress style={{display: dial ? "block" : "none"}} size="xs" isIndeterminate />
            </Stack>
        </Stack>
    );
}

export default AvailableButton;
