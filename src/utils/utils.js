import { Device } from 'twilio-client';
import { SERVER_BASE, CORE_CRM_URL } from '../constants'
// Instead of Connection.js
var ConnectToTwilio = function(
  token,
  displayToast,
  toggleDial,
  transferCalls,
  setTransferCalls,
  setAgentStatus,
  setHoldTime
) {

  var speakerDevices = document.getElementById("speaker-devices");
  var outputVolumeBar = document.getElementById("output-volume");
  var inputVolumeBar = document.getElementById("input-volume");
  var volumeIndicators = document.getElementById("volume-indicators");

  var device;
  var reconnected = false;
  var outboundCall = false;

  console.log("Requesting Access Token...");

 connection();

  function connection () {
      // Setup Twilio.Device
      device = new Device(token, {
        codecPreferences: ["opus", "pcmu"],
        fakeLocalDTMF: true,
        enableRingingState: true
      });
      window.TwilioDevice = device;

      device.on("ready", function(device) {
        console.log("Twilio.Device Ready!");
        if (reconnected) {
          // change agent status
          function updateWorkerActivity(nextAct, activityDict) {
            var nextActivity = nextAct;
            var actParsed = activityDict;
            var nextActivitySid = actParsed[nextActivity];
            window.worker.update({"ActivitySid": nextActivitySid});
          }
          
          function changeWorkerActivity (nAct) {
            fetch(SERVER_BASE + `/get-activities?Token=${token}`)
            .then(res => res.json())
            .then(json => updateWorkerActivity(nAct, json));
          }
          changeWorkerActivity("WrapUp");
          reconnected = false;
        }
      });

      device.on("error", function(error) {
        outboundCall = false;
        toggleDial(false)
        console.log("Twilio.Device Error: " + error.message);
        if (error.message === "JWT Token Expired"){
          console.log("getting new token");
          document.getElementById("token-alert").style.display = "flex"
        }
        else if (error.message === "Connection with Twilio was interrupted.") {
          // trigger function to change activity
          console.log('Twilio Device Connection Interupted.');
          reconnected = true;
        }
      });

      device.on("connect", function(conn) {
        console.log("CONNECTED: ", conn);
        document.getElementById("button-call").disable = false
        document.getElementById("button-call").style.background = ''
        let taskSid = document.getElementById('task-sid').value;
        console.log("TaskSid: ", taskSid);
        toggleDial(false)
        console.log("OUTBOUND: ", outboundCall)
        if (outboundCall) {
          setTimeout(() => {
            addOutboundConferenceParticipant(conn.message.outboundTo, document.getElementById('task-sid').value)
            setAgentStatus('OnCall');
          }, 1000);
        }
        console.log("Successfully established call!");
        displayToast("Connect", "Successfully established call", "info")
        volumeIndicators.style.display = "block";
        bindVolumeIndicators(conn);

        document.getElementById('button-mute').onclick = function () {
          if (this.getAttribute("aria-label") === 'Mute') {
            conn.mute(true);
            console.log('muting');
          } else {
            conn.mute(false);
            console.log('unmuting');
          }
        };

        // dtmf tone for dialpad
        const dialPad = ['dp1','dp2','dp3','dp4','dp5','dp6','dp7','dp8','dp9','dp0','dp*','dp#'];
        dialPad.forEach(buttonId => {
          document.getElementById(buttonId).onclick = function () {
            console.log("Value: ", this.value)
            conn.sendDigits(this.value);
          };
        });
      });


      device.on("disconnect", function(conn) {
        if (outboundCall) {
          setAgentStatus('OnTask');
          outboundCall = false;
        }
        // Sending Hold time to CRM side
        let taskSid = document.getElementById('task-sid').value;
        let holdCounter = document.getElementById("holdCounter").innerText;
        let callTimeCounter = document.getElementById("callTimeCounter").innerText;

        console.log("TaskSid: ", taskSid)
        console.log("holdTime: ", holdCounter);
        console.log("callTimeCounter: ", callTimeCounter);
        const url = `${CORE_CRM_URL}holdtime?TaskSid=${taskSid}&callTime=${callTimeCounter}&holdTime=${holdCounter}&token=WaJ65KXonNW4EH`;
        const options = {
          method: 'GET',
          mode: 'no-cors',
          headers: {
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          }
        };

        fetch(url, options)
        .then(response => {
            console.log("HoldTimeEND: ",response)
        })
        .catch(err => console.log("ERROR: ",err))

        setHoldTime(0);
        displayToast("Disconnect", "End of call", "info")
      });

      device.on("incoming", function(conn) {
        // displayToast("Incoming", "Incoming connection from " + conn.parameters.From, "success")
        var archEnemyPhoneNumber = "+12093373517";

        if (conn.parameters.From === archEnemyPhoneNumber) {
          conn.reject();
          alert("It's your nemesis. Rejected call.");
        } else {
          // accept the incoming connection and start two-way audio
          conn.accept();
        }
      });
      device.audio.on("deviceChange", updateAllDevices.bind(device));

      // Show audio selection UI if it is supported by the browser.
      if (device.audio.isOutputSelectionSupported) {
        document.getElementById("output-selection").style.display = "block";
      }
  }

  // Bind button to make call
  document.getElementById("button-call").onclick = function() {
    // get the phone number to connect the call to
    var params = {
      outboundTo: document.getElementById("phone-number").value,
      workerSid: document.getElementById('worker-sid').value,
      taskSid: document.getElementById('task-sid').value,
      existingConference: true,
      Token: token
    };
    
    if (!validatePhoneForE164(params.outboundTo)) {
      displayToast("Error", "Invalid Phone Number Format: Please follow [+][country code][phone number plus area code]", "error")
    } else {
      console.log("Calling " + params.outboundTo + "...");
      if (device) {
        if(typeof window.TwilioDevice.activeConnection() !== 'undefined') {
          displayToast("Error", "Closing open connection", "error")
          device.disconnectAll();
        }
        var outgoingConnection = device.connect(params);
        outboundCall = true;
        console.log("Setting outboundCall to TRUE")
        outgoingConnection.on("ringing", function() {
          document.getElementById("button-call").disable = true
          document.getElementById("button-call").style.background = '#616a01ba'

          toggleDial(true)
          displayToast("Ringing", "Calling " + params.outboundTo, "success")
          console.log("Ringing: " + params.outboundTo)
        });
      }
    }
  };

  // Bind button to hangup call
  document.getElementById("button-hangup").onclick = function() {
    console.log("Hanging up...");
    if (device) {
      device.disconnectAll();
    }
  };

  function validatePhoneForE164(phoneNumber) {
    const regEx = /^\+[1-9]\d{10,14}$/;

    return regEx.test(phoneNumber);
  };
  
  //transfer functions
  const transferDial = document.getElementById('transfer-dial');
  transferDial.addEventListener("click", function(){dialTransfer()}, false)
  
  function dialTransfer(){
    console.log('Transfer called');
    
    let transferType = document.getElementById('transfer-type-select').value;
    let taskSid = document.getElementById('task-sid').value;
    let conferenceSid = document.getElementById('transfer-conference').innerText;
    
    if (transferType === 'queues') {
      let reservationSid = document.getElementById('reservation-sid').value;
      let transferSelect = document.getElementById('transfer-select');
      var selectedOptionText= transferSelect.options[transferSelect.selectedIndex].text;
      let callSid = document.getElementById('call-sid').value;
      let caseId = document.getElementById('case-id').value;
      document.getElementById('transferoncall-buttons').style.display = "block";
      toggleDial(true)
      transferToQueue (selectedOptionText, taskSid, reservationSid, callSid, caseId) 
    } else {
      let selInput = document.getElementById('transfer-select').value;
      let texInput = document.getElementById('transfer-text').value;
      let dialVal = undefined; 
      let validNumber = true;

      console.log("selInput: ", selInput);
      if (selInput === 'custom'){
        if(validatePhoneForE164(texInput)){
          dialVal = texInput;
        } else{
          validNumber = false;
          //raise error invalid phone number
          displayToast("Error", "Invalid Phone Number Please use E164 PhoneNumber Format", "error")
        }
      } else{
        dialVal = selInput;
      }
      if (validNumber) {
        toggleDial(true)
        document.getElementById('transferoncall-buttons').style.display = "block";
        addConferenceParticipant(dialVal, taskSid, conferenceSid);
      }
    }
  }

  function transferToQueue (queueName, taskSid, reservationSid, callSid, case_id) {
    const url = SERVER_BASE + '/task-transfer';
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({
        task_sid: taskSid,
        reservation_sid: reservationSid,
        call_sid: callSid,
        queue_name: queueName,
        case_id: case_id,
        Token: token
      })
    };

    fetch(url, options)
    .then(response => {
      console.log(response.status);
      toggleDial(false)
      device.disconnectAll()
    })
    .catch(err => {
      console.log(err)
      displayToast("Error", "TypeError: Failed to fetch", "error")
      toggleDial(false)
      document.getElementById('transferoncall-buttons').style.display = "none";
    });
  }

  // Adding outbound participants to the conference call
  function addOutboundConferenceParticipant (toNum, taskSid) {
    const url = SERVER_BASE + '/outbound-add';
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({
        to_number: toNum,
        task_sid: taskSid,
        Token: token
      })
    };

    fetch(url, options)
    .then(function(response) {
      // The response is a Response instance.
      // You parse the data into a useable format using `.json()`
      return response.json();
    }).then(function(data) {
      toggleDial(false)
      console.log("/outbound-add: ", data);
      if (transferCalls.length === 0) {
        document.getElementById('transfer-participant').innerText = data.participant_sid
      }
      // const conferenceSid = document.getElementById('transfer-conference').innerText
      // console.log("ConferenceSid: ", conferenceSid);
      setTransferCalls(transferCalls => [...transferCalls, {
        status: `connecting to ${toNum}`,
        participantSid: data.participant_sid,
        number: toNum,
        hold: false
      }])

      // `data` is the parsed version of the JSON returned from the above endpoint.
      console.log(data);  // { "userId": 1, "id": 1, "title": "...", "body": "..." }
    })
    .catch(err => {
      console.log(err)
      displayToast("Error", "TypeError: Failed to fetch", "error")
      toggleDial(false)
      document.getElementById('transferoncall-buttons').style.display = "none";
    });
  }

  // server side conference function calls
  function addConferenceParticipant (toNum, taskSid, conferenceSid) {
    const url = SERVER_BASE + '/conference-add';
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({
        to_number: toNum,
        task_sid: taskSid,
        conference_sid: conferenceSid,
        Token: token
      })
    };

    fetch(url, options)
    .then(function(response) {
      // The response is a Response instance.
      // You parse the data into a useable format using `.json()`
      return response.json();
    }).then(function(data) {
      toggleDial(false)
      console.log("/conference-add: ", data);
      const conferenceSid = document.getElementById('transfer-conference').innerText
      console.log("ConferenceSid: ", conferenceSid);
      setTransferCalls(transferCalls => [...transferCalls, {
        status: `connecting to ${toNum}`,
        conferenceSid: conferenceSid,
        participantSid: data.participant_sid,
        number: toNum,
        hold: false
      }])

      // `data` is the parsed version of the JSON returned from the above endpoint.
      console.log(data);  // { "userId": 1, "id": 1, "title": "...", "body": "..." }
    })
    .catch(err => {
      console.log(err)
      displayToast("Error", "TypeError: Failed to fetch", "error")
      toggleDial(false)
      document.getElementById('transferoncall-buttons').style.display = "none";
    });
  }
/* device options/settings */
  document.getElementById("get-devices").onclick = function() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(updateAllDevices.bind(device));
  };

  speakerDevices.addEventListener("change", function() {
    var selectedDevices = [].slice
      .call(speakerDevices.children)
      .filter(function(node) {
        return node.selected;
      })
      .map(function(node) {
        return node.getAttribute("data-id");
      });

    device.audio.speakerDevices.set(selectedDevices);
  });

  function bindVolumeIndicators(connection) {
    connection.on("volume", function(inputVolume, outputVolume) {
      var inputColor = 'linear-gradient(to right, green, yellow, red)';
      if (inputVolume < 0.5) {
        inputColor = 'linear-gradient(to right, rgb(0,128,0,0), rgba(0,128,0,1))';
      } else if (inputVolume < 0.75) {
        inputColor = 'linear-gradient(to right, green, yellow)';
      }

      inputVolumeBar.style.width = Math.floor(inputVolume * 370) + "px";
      inputVolumeBar.style.background = inputColor;

      var outputColor = 'linear-gradient(to right, green, yellow, red)';
      if (outputVolume < 0.5) {
        outputColor = 'linear-gradient(to right, rgb(0,128,0,0), rgba(0,128,0,1))';
      } else if (outputVolume < 0.75) {
        outputColor = 'linear-gradient(to right, green, yellow)';
      }

      outputVolumeBar.style.width = Math.floor(outputVolume * 370) + "px";
      outputVolumeBar.style.background = outputColor;
    });
  }

  function updateAllDevices() {
    updateDevices(speakerDevices, device.audio.speakerDevices.get());
  }
  // Update the available ringtone and speaker devices
  function updateDevices(selectEl, selectedDevices) {
    selectEl.innerHTML = "";

    device.audio.availableOutputDevices.forEach(function(device, id) {
      var isActive = selectedDevices.size === 0 && id === "default";
      selectedDevices.forEach(function(device) {
        if (device.deviceId === id) {
          isActive = true;
        }
      });

      var option = document.createElement("option");
      option.label = device.label;
      option.setAttribute("data-id", id);
      if (isActive) {
        option.setAttribute("selected", "selected");
      }
      selectEl.appendChild(option);
    });
  }
}
    
export default ConnectToTwilio;
