 // Toolbar events
 /*document.getElementById('minimizeBtn').addEventListener('click', e =>{
   _getCurrentWindow.minimize();
 });

 document.getElementById('closeBtn').addEventListener('click', e =>{
   _getCurrentWindow.close();
 });*/

 document.getElementById('refreshBtn').addEventListener('click', e =>{
   _getCurrentWindow.reload();
 });

 document.getElementById('saveBtn').addEventListener('click', e =>{
   // Parse payload in URL and parse it into object
    const payload = _parse_url(location.search, true).query;
    console.log('Payload: ', payload);

    // save current media 
    _save_item(payload);
    
 });

 // handle toolbar visibility
 _getCurrentWindow.on('blur', () =>{
     console.log('panel lost focus.. hiding toolbar');
     document.getElementsByClassName('toolbar')[0].style.visibility = "hidden";
 });

  _getCurrentWindow.on('focus', () =>{
     document.getElementsByClassName('toolbar')[0].style.visibility = "visible";
 });
 


