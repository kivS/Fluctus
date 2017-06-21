if (!window['YT']) {var YT = {loading: 0,loaded: 0};}if (!window['YTConfig']) {var YTConfig = {'host': 'http://www.youtube.com'};}if (!YT.loading) {YT.loading = 1;(function(){var l = [];YT.ready = function(f) {if (YT.loaded) {f();} else {l.push(f);}};window.onYTReady = function() {YT.loaded = 1;for (var i = 0; i < l.length; i++) {try {l[i]();} catch (e) {}}};YT.setConfig = function(c) {for (var k in c) {if (c.hasOwnProperty(k)) {YTConfig[k] = c[k];}}};var a = document.createElement('script');a.type = 'text/javascript';a.id = 'www-widgetapi-script';a.src = 'https://s.ytimg.com/yts/jsbin/www-widgetapi-vflPSGdpW/www-widgetapi.js';a.async = true;var b = document.getElementsByTagName('script')[0];b.parentNode.insertBefore(a, b);})();}




//import '../helpers/checkInternet.js';
import {remote} from 'electron';
const url = require('url');
const log = remote.getGlobal('logger');

const TAG = 'From youtube video panel - ';



// Parse payload in URL and parse it into object
const payload = url.parse(location.search, true).query;
console.log('Payload: ', payload);

// Get video info from payload
const video = url.parse(payload.video_url, true);
console.log('Youtube Video Parsed query: ', video);

// Get video query (videoId & listId)
const video_query = video.query;

// Youtube video player
let player;

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

  // For playlists
  if('list' in video_query){

    player.cuePlaylist({
        list: video_query.list,
        startSeconds: starting_time,
        index: parseInt(video_query.index - 1)
    });


  // For single videos
  }else{

    player.cueVideoById({
        videoId: video_query.v,
        startSeconds: starting_time
    });

  }
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

    log.error(TAG, yotube_error);
    console.error('kaput: ', yotube_error);

  }else{
    // make it crash..
    process.crash();
  }


}

function onPlayerStateChange(e){
//console.log(e);
}
