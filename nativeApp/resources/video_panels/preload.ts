import {remote} from 'electron';
import * as url from 'url';



process.once('loaded', function() {
  global['_log'] = remote.getGlobal('logger');
  global['_parse_url'] = url.parse;
  global['_process_crash'] = process.crash;
  global['_getCurrentWindow'] = remote.getCurrentWindow();
  global['_disableDragAndDrop'] = disableDragAndDrop;

  // disables drag and drop on toolbar
  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    return false;
  }, false);

  document.addEventListener('drop', (event) => {
    event.preventDefault();
    return false;
  }, false);

});


function disableDragAndDrop() {
    // disables drag and drop on iframe
    console.log('disable drag & drop - Active');
    let _iframe = document.getElementsByTagName('iframe')[0].contentDocument;

    _iframe.addEventListener('dragover', (event) => {
      event.preventDefault();
      return false;
    }, false);

    _iframe.addEventListener('drop', (event) => {
      event.preventDefault();
      return false;
    }, false);
}
