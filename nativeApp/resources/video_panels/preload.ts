import {remote} from 'electron';
import * as url from 'url';



process.once('loaded', function() {
  global['_log'] = remote.getGlobal('logger');
  global['_parse_url'] = url.parse;
  global['_process_crash'] = process.crash;
});
