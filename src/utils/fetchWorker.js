import { SERVER_BASE ,LARAVEL_CRM_URL, CORE_CRM_URL } from '../constants'
import { pushNotification } from './pushNotification'
function registerTaskRouterCallbacks(
  voiceToken,
  setAgentStatus,
  displayToast,
  setPhoneNumber,
  transferCalls
) {

  window.worker.on('ready', function(worker) {
    // Check if there is a reservation for that agent and if it wrapup
    // change the agent status to wrapup
    window.worker.fetchReservations(
      function(error, reservations) {
        if(error) {
            console.log(error.code);
            console.log(error.message);
            return;
        }
        console.log("RESERVATION!!!")
        var data = reservations.data;
        for (let i = 0; i < data.length; i++) {
          console.log(data[i]);
          if (data[i].reservationStatus === "accepted") {
            changeWorkerActivity('OnTask', voiceToken);
            document.getElementById("crm-iframe").src = `${LARAVEL_CRM_URL}entryform/?phone=${data[i].task.attributes.name}&did=${data[i].task.attributes.to}&caseid=${data[i].task.attributes.case_id}&worker_sid=${data[i].workerSid}&customer_id=${data[i].task.attributes.customer_id}}`;
          }
        }
      }
    );
    setAgentStatus(worker.activityName);
    displayToast("Ready", "Successfully registered as: " + worker.friendlyName, "success")
  });

  window.worker.on('reservation.wrapup', function(worker){
    console.log('wrapup');
    changeWorkerActivity('WrapUp', voiceToken);
  })

  window.worker.on('activity.update', function(worker) {
    setAgentStatus(worker.activityName);
    displayToast("Update Activity", "Worker activity changed to: " + worker.activityName, "info")
  });

  // play alert in browser
  const audio = new Audio("./assets_alert_tone.mp3")

  window.worker.on("reservation.created", function(reservation) {
    // console.log("Reservation Details: ", reservation)

    pushNotification(reservation)
    // End Push Notification
    setPhoneNumber(reservation.task.attributes.name);
    displayToast("Incoming task", "You have a task from: " + reservation.task.attributes.name, "success")

    document.getElementById('accept-call').style.display = 'block';
    document.getElementById('caller-details').style.display = 'block';
    document.getElementById('incoming-details').innerText = `Incoming Task from ${reservation.task.attributes.name}`;
    document.getElementById('incoming-queue').innerText = `Queue: ${reservation.task.taskQueueFriendlyName}`;
    audio.play();
    audio.loop = true;

    document.getElementById('call-accept').onclick = function () {
      console.log("Accepting Call...")
      document.getElementById("call-accept").disable = true
      document.getElementById("call-accept").style.background = '#616a01ba'
      audio.pause();
      const url = SERVER_BASE + '/reservation-accept';
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          task_sid: reservation.task.sid,
          reservation_sid: reservation.sid,
          attributes: reservation.task.attributes,
          type:'outbound',
          Token: voiceToken
        })
      };

      fetch(url, options)
      .then(response => {
        document.getElementById("call-accept").disable = false
        document.getElementById("call-accept").style.background = ''
        console.log("Accept response status Code: ",response.status)
        console.log("Accept response: ",response)
      })
      .catch(err => {
        document.getElementById("call-accept").disable = false
        document.getElementById("call-accept").style.background = ''
        console.error("Error in accepting reservation", err)
      });
    }

    document.getElementById('call-reject').onclick = function () {
      audio.pause();
      // displayToast("Rejecting Call...", "", "warning")
      const url = SERVER_BASE + '/reservation-reject';
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          task_sid: reservation.task.sid,
          reservation_sid: reservation.sid,
          Token: voiceToken
        })
      };

      fetch(url, options)
      .then(response => {
        console.log("Reject response status Code: ",response.status)
        console.log("Reject response: ",response)
      })
      .catch(err => console.error("Error in rejecting reservation", err));
    }
  });

  window.worker.on("reservation.accepted", function(reservation) {
    audio.pause();
    console.log("Reservation Accepted...");
    document.getElementById('accept-call').style.display = 'none';
    document.getElementById('caller-details').style.display = 'block';
    // This for Twilio 
    changeWorkerActivity('OnTask', voiceToken);
    navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
      if (stream.getAudioTracks()[0].muted) {
        displayToast("You are muted", "Please be aware that the caller won't be able to hear your voice", "error")
      }
    })
    .catch(err => console.log(err));
    // getting outboundNumbers 

    // let incomingQueue = reservation.task.taskQueueFriendlyName;
    // console.log("incomingQueueR: ", incomingQueue);
    // fetch(`${LARAVEL_CRM_URL}api/outboundnumbers`, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json;charset=UTF-8'
    //   },
    //   body: JSON.stringify({
    //     queue_name: incomingQueue,
    //   })
    // })
    // .then(response => {
    //   console.log(response.status)
    //   console.log("In fetchWorker object object")
    //   console.log("In fetchWorker outboundnums: ",response.data)
    // })
    // .catch(err => console.log("outbound Error: ", err))
    console.log("Reservation: ", reservation)
    document.getElementById('worker-sid').value = reservation.workerSid
    document.getElementById('task-sid').value = reservation.taskSid
    console.log("TaskSid From FetchWorker1: ", reservation.taskSid);
    console.log("TaskSid From FetchWorker2: ", document.getElementById('task-sid'));
    document.getElementById('reservation-sid').value = reservation.sid
    document.getElementById('case-id').value = reservation.task.attributes.case_id
    
    document.getElementById('incoming-details').innerText = `Connected to: ${reservation.task.attributes.name}`;
    //crm controller
    
    document.getElementById("crm-iframe").src = `${LARAVEL_CRM_URL}entryform/?phone=${reservation.task.attributes.name}&did=${reservation.task.attributes.to}&caseid=${reservation.task.attributes.case_id}&worker_sid=${reservation.workerSid}&customer_id=${reservation.task.attributes.customer_id}}`;
 
    document.getElementById('button-hold').onclick = function () {
      console.log("transferCalls: ", transferCalls)
      console.log("transfer-participant: ", document.getElementById('transfer-participant').innerText)
      
      const url = SERVER_BASE + '/call-hold';
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          participant_sid: document.getElementById('transfer-participant').innerText,
          conference_sid: document.getElementById('transfer-conference').innerText,
          hold_action: this.getAttribute("aria-label") === "Hold Call" ? true : false,
          Token: voiceToken
        })
      };

      fetch(url, options)
      .then(response => {console.log(response.status)});
    };
  });

  window.worker.on("reservation.rejected", function(reservation) {
    audio.pause();
    displayToast("Reservation rejected: ", reservation.sid , "error")
    document.getElementById('accept-call').style.display = 'none';
    document.getElementById('caller-details').style.display = 'none';
  });

  window.worker.on("reservation.timeout", function(reservation) {
    audio.pause();
    displayToast("Reservation timed out!: ", reservation.sid , "error")
    document.getElementById('accept-call').style.display = 'none';
    document.getElementById('caller-details').style.display = 'none';
  });

  window.worker.on("reservation.canceled", function(reservation) {
    audio.pause();
    displayToast("Reservation canceled!: ", reservation.sid , "error")
    document.getElementById('accept-call').style.display = 'none';
    document.getElementById('caller-details').style.display = 'none';
  });

  window.worker.on("reservation.completed", function(reservation) {
    // displayToast("Reservation Completed!: ", reservation.sid , "success")
    console.log("REMOVING CALLER DETAILS>>>")
    document.getElementById('caller-details').style.display = 'none';
    document.getElementById('button-hold').style.display = "inline-block";
    document.getElementById("crm-iframe").src = LARAVEL_CRM_URL
  })

  window.worker.on("task.updated", function(task) {
    console.log("Task updated: ", task);
    document.getElementById('transfer-conference').innerText = task.attributes.conference_sid;
  })

  window.worker.on("token.expired", function(task){
    // generate token expiration message
    document.getElementById("token-alert").style.display = "flex"
  })
}
/* Hook up the agent Activity buttons to TaskRouter.js */
function bindAgentActivityButtons() {
  // Fetch the full list of available Activities from TaskRouter. Store each
  // ActivitySid against the matching Friendly Name
  var activitySids = {};
  window.worker.activities.fetch(function(error, activityList) {
    var activities = activityList.data;
    var i = activities.length;
    while (i--) {
      activitySids[activities[i].friendlyName] = activities[i].sid;
    }
  });
  /* Handle select form on main agent interface status change */
  function changeSelectActivity(nextActivity){
    window.worker.update({ActivitySid: activitySids[nextActivity]});
  }

  const selavail = document.getElementById('availableselectchange');
  selavail.addEventListener("change", function(){changeSelectActivity(selavail.value)}, false);
}
/* update worker activity */
function updateWorkerActivity(nextAct, activityDict) {
  window.worker.update({ActivitySid: activityDict[nextAct]});
}
// todo update url and function
function changeWorkerActivity (nAct, voiceToken) {
  fetch(SERVER_BASE + `/get-activities?Token=${voiceToken}`)
  .then(res => res.json())
  .then(json => updateWorkerActivity(nAct, json));
}

function loadWorker (wtoken, voiceToken, setAgentStatus, displayToast, setPhoneNumber, transferCalls) {
  window.worker = new window.Twilio.TaskRouter.Worker(wtoken);
  registerTaskRouterCallbacks(voiceToken, setAgentStatus, displayToast, setPhoneNumber, transferCalls);
  bindAgentActivityButtons();
}

export function fetchWorkerSid(voiceToken, email, setAgentStatus, displayToast, setPhoneNumber, transferCalls){
  fetch(SERVER_BASE + '/agent-token?email=' + email)
  .then(res => res.json())
  .then(json => {
    loadWorker(json.token, voiceToken, setAgentStatus, displayToast, setPhoneNumber, transferCalls)
  });
}
