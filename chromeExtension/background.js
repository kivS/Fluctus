console.log('Hello there from the background......huhhh');

// Define config constant
const config = {
	SUPPORTED_PORTS: [8001,9000,7000,8000,5000,10000]
}

// native app port
let NATIVE_APP_PORT = null;


// When extension is installed on upgraded
chrome.runtime.onInstalled.addListener( () => {
	// Replace all rules
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		// With a new rule
		chrome.declarativeContent.onPageChanged.addRules([
		 	{
		 		// Trigger me!!
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
	console.log('page_action clicked..', tab);

	if(NATIVE_APP_PORT){
		// Send POST request to open video
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
				// Check promises for port | r != null : [8000] | r[0] : 8000
				let port = responses.filter(r => r != null)[0];
				if(port){
					console.log('server found on port found: ', port);

					// Cache server port
					NATIVE_APP_PORT = port;

					// Send POST request to open video
					openVideoRequest(tab.url);
					
				}else{
					// No server found
					showNoServerError();
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



function showNoServerError(){
	alert("Error.. no server");
}


function openVideoRequest(url){
	console.log('Open video request: ', url);
}