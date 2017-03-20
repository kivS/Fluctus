// For youtube videos
if(location.hostname.lastIndexOf("youtube") != -1){

	// get video currently playing
	const video = document.getElementsByTagName('video')[0];

	// if video then let's pause it
	if(video) video.pause();

}
