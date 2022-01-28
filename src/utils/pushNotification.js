// Start Push Notification
const showError = () => {
  console.log('You blocked the notifications');
}
let notification;
const showNotification = (reservation) => {
    notification = new Notification ('VOCCS System', {
        body: 'An Incoming Call .. ' + reservation.task.attributes.name,
        icon: "https://cdn2.iconfinder.com/data/icons/mobile-smart-phone/64/Call_calling_phone_communication-1024.png",
        requireInteraction: true
    })
    notification.addEventListener("click", function(event) {
      window.focus(); 
      this.close();
    }, false);
}

let granted = false;
export const pushNotification = async (reservation) => {
  // check notification permission
  if (Notification.permission === 'granted') {
      granted = true;
  } else if (Notification.permission !== 'denied') {
      let permission = await Notification.requestPermission();
      granted = permission === 'granted' ? true : false;
  }
  // show notification or error
  granted ? showNotification(reservation) : showError();
}