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

 // handle toolbar visibility
 _getCurrentWindow.on('blur', () =>{
     console.log('panel lost focus.. hiding toolbar');
     document.getElementsByClassName('toolbar')[0].style.visibility = "hidden";
 });

  _getCurrentWindow.on('focus', () =>{
     document.getElementsByClassName('toolbar')[0].style.visibility = "visible";
 });
 


