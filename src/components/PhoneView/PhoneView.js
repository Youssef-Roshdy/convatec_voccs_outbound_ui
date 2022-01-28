import React from 'react'
import AgentView from '../AgentView/AgentView';
import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement,
} from 'react-reflex'
import 'react-reflex/styles.css'
import { LARAVEL_CRM_URL } from '../../constants'

function PhoneView({
  screenMode,
  setWorkerRole,
  agentStatus,
  setAgentStatus,
  token,
  setToken
}) {
  return (
    <ReflexContainer orientation="vertical">
      <ReflexElement className="left-pane" minSize="200">
        <div className="pane-content" style={{height: "100%", width: "100%", overflowX: 'hidden'}}>
          <AgentView 
            key={'agentView'} 
            screenMode={screenMode}
            setWorkerRole={setWorkerRole}
            agentStatus={agentStatus}
            setAgentStatus={setAgentStatus}
            token={token}
            setToken={setToken}
          />
        </div>
      </ReflexElement>

      <ReflexSplitter style={{zIndex: 1}}/>

      <ReflexElement className="right-pane"
        flex={0.75}
        minSize="400"
        maxSize="900">
        <div className="pane-content"  style={{background: "gray.200", height:"100%"}}>
          <iframe 
              id="crm-iframe"
              title="CRM_IFrame"
              src={LARAVEL_CRM_URL}
              style={{
                  height: "100%", 
                  width: "100%",
              }}
          ></iframe>
        </div>
      </ReflexElement>

    </ReflexContainer>
  );
}

export default PhoneView
