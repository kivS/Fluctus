import {remote} from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';

// Settings file path
const settings_file_path = path.join(remote.app.getPath('home'), 'fluctus_settings.json');

/**
 * loads resources into renderer processes once they're ready
 */
 process.once('loaded', function() {

   // init settings file
   initSettings()

   global['_log'] = remote.getGlobal('logger');
   global['_parse_url'] = url.parse;
   global['_process_crash'] = process.crash;
   global['_getCurrentWindow'] = remote.getCurrentWindow();
   global['_disableDragAndDrop'] = disableDragAndDrop;
   global['_get_env'] = getEnv;
   global['_settings'] = getSettings;
   global['_save_settings'] = saveSettings;



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


/**
 * disables drag and drop on iframe
 */
 function disableDragAndDrop() {
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


function getEnv(){
  if(process.env.NODE_ENV){
    let env;
    switch (process.env.NODE_ENV) {
      case "dev":
      env = 'dev';
      break;

      case "test":
      env = 'test';
      break;

      default:
      env='prod';
      break;
    }

    return env;

  }else{
    return 'prod';
  }
}

function getSettings(){
  return new Promise((resolve, reject) =>{
      fs.readFile(settings_file_path, 'utf-8', (err, data) =>{
        if(err) reject(err);

        let json_data = null;

        try{
          json_data = JSON.parse(data)

        }catch(e){
           reject("error_parsing_settings")
        }
        
        if(json_data) resolve(json_data)
      })
  })
 

}



function saveSettings(data){
  fs.writeFile(settings_file_path, JSON.stringify(data), (error) =>{
    if(error) global['_log'].error(error)
  })
}


function initSettings(){
  // data to save in settings file
  const data = {updated_at: new Date().getTime() }

  return new Promise((resolve, reject) =>{
    fs.stat(settings_file_path, (err, status) =>{
      if(err) reject(err);

      if(status){
        global['_log'].info('Settings file is present!');
        resolve(true)
      }

    })
  })
  .catch(error =>{
    // 
    global['_log'].info('No settings file. Creating one..');
    saveSettings(JSON.stringify(data))
  })

}