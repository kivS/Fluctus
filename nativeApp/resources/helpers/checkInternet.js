// if net is off send notif
if(navigator.onLine == false){
	let myNotification = new Notification('Error', {
    body: 'No internet access'
  })

}
