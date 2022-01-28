import React, { useState } from "react";
import useInterval from 'use-interval'

function StopWatch({agentStatus, condition}) {
    const [counter, setCounter] = useState({
        min: 0,
        sec: 0,
    })
    
    useInterval(() => {
        if (agentStatus === condition) {
            if (counter.sec === 59){
                setCounter({
                    min: counter.min + 1,
                    sec: 0
                })
            }
            else {
                setCounter({
                    min: counter.min,
                    sec: counter.sec + 1
                })
            }
        } else {
            setCounter({
                min: 0,
                sec: 0,
            })
        }
    }, 1000)
    
    return (
        <div style={{fontFamily: 'Inter'}}>
            {counter.min < 10 ? "0"+counter.min : counter.min}:{counter.sec < 10 ? "0"+counter.sec : counter.sec}
        </div>
    );
}

export default StopWatch;
