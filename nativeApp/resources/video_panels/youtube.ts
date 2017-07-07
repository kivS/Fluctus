const TAG = 'From youtube video panel - ';



// Parse payload in URL and parse it into object
const payload = _parse_url(location.search, true).query;
console.log('Payload: ', payload);

// Get video info from payload
const video = _parse_url(payload.video_url, true);
console.log('Youtube Video Parsed query: ', video);

// Get video query (videoId & listId)
const video_query = video.query;

// Youtube video player
let player;
declare var YT: any;

function onYouTubeIframeAPIReady() {
   player = new YT.Player('video_player', {
     height: '100%',
     width: '100%',
     events: {
       'onReady': onPlayerReady,
       'onStateChange': onPlayerStateChange,
       'onError': onError
     }
   });
}

// Events
function onPlayerReady(){
  console.log('Youtube Player Ready');

  // Check if start time on video is set then remove all non number characters and return int
  const starting_time = payload.video_currentTime || video_query.t || 0;
  console.log('Starting video at(seconds): ', starting_time);

 /* // For playlists
  if('list' in video_query){

    player.cuePlaylist({
        list: video_query.list,
        startSeconds: starting_time,
        index: parseInt(video_query.index) - 1
    });


  // For single videos
  }else{

    player.cueVideoById({
        videoId: video_query.v,
        startSeconds: starting_time
    });

  }*/

  // only single videos while playlist bug is not fixed
  player.cueVideoById({
      videoId: video_query.v,
      startSeconds: starting_time
  });
 
}



function onError(err){
  let youtube_error_code = err.data;

  let error_codes = {
    '2':   'The request contains an invalid parameter value.',
    '5':   'error related to the HTML5 player has occurred.',
    '100': 'The video requested was not found.',
    '101': 'The owner of the requested video does not allow it to be played in embedded players.',
    '150': 'The owner of the requested video does not allow it to be played in embedded players.'

  }

  let yotube_error = error_codes[`${youtube_error_code}`] || 'Weird youtube error... no ideia what!';

  if(youtube_error_code){

    _log.error(TAG, yotube_error);
    console.error('kaput: ', yotube_error);

  }else{
    // make it crash..
    _process_crash();
  }


}

function onPlayerStateChange(e){
//console.log(e);
}


