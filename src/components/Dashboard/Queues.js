import React, { useState } from 'react';
import {
    Table, Thead, Tbody,
    Tr, Th, Td,
    Box, HStack, SkeletonText,
} from "@chakra-ui/react"
import { 
    IoMdCheckmarkCircle, 
    IoMdCloseCircle,
    IoIosRemoveCircle,
} from "react-icons/io";

export default function Queues({queueData}){
    let queueArray = queueData
    const queueItems = queueArray.map((queue, i) =>
    <Tr key={queue.name}>
            <Th key={"On_Th1_" + i} scope="row">{queue.name}</Th>
            <Td key={"On_Td1_" + i} textAlign="center">{queue.active}</Td>
            <Td key={"On_Td2_" + i} textAlign="center">{queue.waiting}</Td>
            <Td key={"On_Td3_" + i} textAlign="center">{queue.wrapping}</Td>
            <Td key={"On_Td4_" + i} textAlign="center">{queue.reserved}</Td>
            <Td key={"On_Td5_" + i} textAlign="center">{queue.longWait}</Td>
            <Td key={"On_Td6_" + i} >
                <Box d="flex" justifyContent="space-between">
                    <HStack>
                        <div style={{ color: 'rgb(76, 175, 80)' }}>
                            <IoMdCheckmarkCircle style={{marginTop: "5px"}}/>
                        </div>
                        <span>{queue.workersAvailable}</span> 
                    </HStack>
                    <HStack>
                        <div style={{ color: 'rgb(221, 57, 43)' }}>
                            <IoMdCloseCircle style={{marginTop: "5px"}}/>
                        </div>
                        <span>{queue.wrapping} </span> 
                    </HStack>
                    <HStack>
                        <div style={{ color: 'rgb(96, 100, 113)' }}>
                            <IoIosRemoveCircle style={{marginTop: "5px"}}/>
                        </div>
                        <span>{queue.workersEligible - queue.workersAvailable} </span> 
                    </HStack>
                </Box>
            </Td>
        </Tr>
    );
    
    const loadingSkeleton =  
    <Tr>
        <Th scope="row">
            <SkeletonText mt="3" noOfLines={3} spacing="3"/>
        </Th>
        <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
        <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
        <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
        <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
        <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
        <Td><SkeletonText mt="3" noOfLines={3} spacing="3"/></Td>
    </Tr> 
    const [renderTable, setRenderTable] = useState(true);

    function handleSubmit() {
        setTimeout(() => {
            setRenderTable(false);    
        }, 2000)
    }
    
    return [
        <div>
            <Table className="Table Table-bordered Table-sTriped">
                <Thead>
                    <Tr>
                        <Th scope="col">Name</Th>
                        <Th scope="col" textAlign="center">Active</Th>
                        <Th scope="col" textAlign="center">Waiting</Th>
                        <Th scope="col" textAlign="center">Wrapping</Th>
                        <Th scope="col" textAlign="center">Reserved</Th>
                        <Th scope="col" textAlign="center">LongWait</Th>
                        <Th scope="col" textAlign="center">Agents Available</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        handleSubmit()
                    }
                    {
                        renderTable || queueItems.length < 1 ? loadingSkeleton : queueItems
                    }
                </Tbody>
            </Table>
        </div>
    ]
}
