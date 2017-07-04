// removes Object.defineProperty(exports, "__esModule", { value: true }); from compiled js
export = 0;

//import {remote} from 'electron';
import * as url from 'url';
//const log = remote.getGlobal('logger');
//const TAG = 'From Soundcloud Panel - ';

//log.info(TAG, "Hello from video panel!!!");

// get payload and parse it into object 
const payload = url.parse(location.search, true).query;
console.log('Payload: ', payload);


// Load soundcloud
declare var SC: any;

const soundcloud = SC.Widget(document.getElementById('player'));

soundcloud.load(payload.video_url);

