import React from "react";
import {
    Select, Box, Link, Text, Stack, HStack
} from '@chakra-ui/react';

function AudioSettingPopUp (){
    return (
        <>
            <Box id="output-selection" w="100%" textAlign='center'>
                <Box>
                    <Text colorScheme="blackAlpha">Speaker Devices</Text>
                    <Select  id="speaker-devices"></Select>
                </Box>
                <Link id="get-devices">
                    Seeing unknown devices?
                </Link>
            </Box>
            <Stack id="volume-indicators" w="100%" h="100%" d='none'>
                <HStack>
                    <Text w="30%" textAlign='left' fontSize="md" colorScheme="blackAlpha">Mic Volume</Text>
                    <Box id="input-volume" h="15px" maxW="375px"></Box>
                </HStack>
                <HStack>
                    <Text w="30%" textAlign='left' fontSize="md" colorScheme="blackAlpha">Speaker Volume</Text>
                    <Box id="output-volume" h="15px" maxW="375px"></Box>
                </HStack>
            </Stack>  
        </>
    )
} 

export default AudioSettingPopUp;
