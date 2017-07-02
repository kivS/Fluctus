// removes Object.defineProperty(exports, "__esModule", { value: true }); from compiled js
export = 0;

import {remote} from 'electron';
import * as url from 'url';
const log = remote.getGlobal('logger');
const TAG = 'From vimeo Video Panel - ';

log.info(TAG, "Hello from video panel!!!");

// get payload and parse it into object 
const payload = url.parse(location.search, true).query;
console.log('Payload: ', payload);

// create video player
declare var Vimeo: any;
let player = new Vimeo.Player('video_player', {
  id: payload.video_url,
  color: "c13e3e",
  autopause: false

});

// set video time if there's time
if(payload.time){
  player.setCurrentTime(parseFloat(payload.time)).then(seconds =>{
    player.pause();

  }).catch(error =>{
    console.error(error);
    log.error(TAG, error);
  });

}