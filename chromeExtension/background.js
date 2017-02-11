console.log('Hello there from the background......huhhh');

// Define config constant
const config = {
	SUPPORTED_PORTS: [6000, 53]
}


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

	// Get Current Url info
	currentHostname = parseUrl(tab.url).hostname;




});
