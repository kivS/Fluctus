console.log('Background here.. prepare for lift off..');

// Define config constant
const config = {
	SUPPORTED_PORTS: [8001,9000,7000,8000,5000,10000],
	NATIVE_APP_INSTALL_URL: 'https://vikborges.com',
	STORAGE_KEY_NATIVE_APP_PORT : 'fd_native_app_port'
}

// native app default port
let NATIVE_APP_PORT = getNativeAppPortFromStorage();


// ADD RULES - When extension is installed on upgraded
chrome.runtime.onInstalled.addListener( () => {
	// Replace all rules
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		// With a new rule
		chrome.declarativeContent.onPageChanged.addRules([
		 	{
		 		// Youtube Trigger me!!
		 		conditions: [
		 			new chrome.declarativeContent.PageStateMatcher({
		 				pageUrl: { hostContains: 'youtube',  pathContains: 'watch' }
		 			})
		 		],

		 		// Shows the page_action
		 		actions: [
		 			new chrome.declarativeContent.ShowPageAction()

		 		]
		 	}
		]);
	});
});


// Page_action click event
chrome.pageAction.onClicked.addListener( tab => {
	//console.debug('page_action clicked..', tab);

	if(NATIVE_APP_PORT){
		// Send POST request to open video
		console.log('Using native app default port: ', NATIVE_APP_PORT);
		openVideoRequest(tab.url);

	}else{

		// PING NATIVE APP

		let ping_urls = config.SUPPORTED_PORTS.map(port =>{
			return [`http://localhost:${port}/ping`, port];
		})

		Promise.all(ping_urls.map(url => 
				fetch(url[0])
					.then(response =>{
						if(response.ok){
							// If server is found let's return the port
							return url[1];
						}
					})
					.catch(error =>{
						console.warn(`${url[0]}: was not the chosen one!`);
						return null;
					})
			))
			.then(responses =>{
				// Check promises for port
				let port = responses.filter(r => r != null)[0];
				if(port){
					console.log('pinged server successfully on port: ', port);

					// Cache server port
					NATIVE_APP_PORT = port;
					setNativeAppPortToStorage(port);

					// Send POST request to open video
					openVideoRequest(tab.url);
					
				}else{
					// No server found
					showNoServerErrorMsg();
				}
			})
			.catch(err =>{
				console.error('Something went wrong...', err);
			});
	}

	

});



//*****************************************************
//			   HELPER FUNCTIONS						   
//									  				   				
//*****************************************************


/**
 * Send request to native app to open video panel
 * @param  {[string]} url 
 * @return {[type]}     
 */
function openVideoRequest(url){

	let payload = {};
	let port = NATIVE_APP_PORT;

	payload.video_url = url;
	
	// Check video type
	switch(true){
		case url.includes('youtube'):
			payload.video_type = 'youtube';
		break;
	}
	console.log('Payload to send: ', payload);

	// Make request
	fetch(`http://localhost:${port}/start_video`,{
		method: 'POST',
		headers: new Headers({"Content-Type": "application/json"}),
		body: JSON.stringify(payload)
	})
	.then(response =>{
		if(response.ok){
			console.info('Video start request sent!');
		}
	})
	.catch(err => {
		console.error('Failed to send request to native app: ', err);

		// If request fails let's reset default native app port, that way we'll have to ping for new port
		NATIVE_APP_PORT = null;
		setNativeAppPortToStorage("");

	});

}


/**
 * Shows dialog to user if server is not alive
 * and lets link to download page for the native app
 * 
 */
function showNoServerErrorMsg(){
	if(confirm('Companion app is not installed or running.. \n\n Install companion app?')){
		chrome.tabs.create({ url: config.NATIVE_APP_INSTALL_URL });
	}
}


/**
 * Get saved native app port
 * 
 *@return {[string]} port
 */
function getNativeAppPortFromStorage(){
	port = localStorage.getItem(config.STORAGE_KEY_NATIVE_APP_PORT);
	
	return port;
	
}

/**
 * Save native_app_port to storage
 * @param  {[int]} port
 */
function setNativeAppPortToStorage(port){
	localStorage.setItem(config.STORAGE_KEY_NATIVE_APP_PORT, port);
	
}
