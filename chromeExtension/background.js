console.log('Hello there from the background......huhhh');


// When extension is installed on upgraded
chrome.runtime.onInstalled.addListener( details => {
	// Replace all rules
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		// With a new rule
		chrome.declarativeContent.onPageChanged.addRules([
		 	{
		 		// Trigger me!!
		 		conditions: [],

		 		// Shows the page_action
		 		actions: []
		 	}
		]);
	});
});