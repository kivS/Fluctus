console.log('Hello there from the background......huhhh');

// Define config constant
const config = {
	SUPPORTED_PORTS: [8001,9000,7000,8001,5000,10000],
	NATIVE_APP_INSTALL: 'https://vikborges.com'
}

// native app default port
let NATIVE_APP_PORT = null;


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
	console.log('page_action clicked..', tab);

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

function openVideoRequest(url){
	console.log('Open video request: ', url);
}


/**
 * Shows dialog to user if server is not alive
 * and links to download page of native app
 * 
 */
function showNoServerError(){
	if(confirm('Companion app is not installed or running.. \n\n Install companion app?')){
		chrome.tabs.create({ url: config.NATIVE_APP_INSTALL });
	}
}


