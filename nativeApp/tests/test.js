const Application = require('spectron').Application;
const path = require('path');
const assert = require('assert');
const http = require('http');
const request = require('request');

const app_path = path.join(__dirname, '..', 'main.js');

const config = {
  server: 'http://localhost:8753'
}

/**
 * New application wrapper
 * @return {[type]} [description]
 */
function new_app() {
  return new Application({
      path: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      args: [app_path]
    })
}


/**
 * Send start_video request 
 * @param  {[type]}   payload [description]
 * @param  {Function} cb      --> callback
 * @return {[type]}           error || response && body of request
 */
function start_video_request(payload, cb){
  request.post({
     url: `${config.server}/start_video`,
     headers: {"Content-Type": "application/json"},
     body: JSON.stringify(payload)

  }, (err, res, body)=>{
      if(err) cb(err)
      else cb(null, res, body)
  })
  
}


/****************************************************************************************************************



/**
 *    TESTS
 */

describe('Application Startup', function () {
  this.timeout(60000)

  beforeEach(function () {
    this.app = new_app()
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      // close app
      return this.app.stop()
 
    }
  })


  describe('On launch', function() {
      it('should get Dummy test page', function(done) {
          this.app.browserWindow.getTitle().then(title =>{
             assert.equal(title, "TEST_PAGE");
             done();
          });
      })
  })


  describe('On local server startup', function(){
      it('should return status: "alive" when pinged!', function() {

          let url = `${config.server}/ping`;

          return new Promise((resolve, reject) => {
              http.get(url, response => {
                response.setEncoding('utf8');

                var response_data = [];

                response.on('data', data => {
                  response_data.push(data);
                });

                response.on('end', () => {
                  var resp = JSON.parse(response_data.toString());
                  
                  resolve(resp.status);

                });

                response.on('error', error => { 
                  reject(error);
                });

              });

          }).then(result =>{
              assert.equal('alive', result);

          }).catch(error =>{
              console.error(error);
          })

      })

 /*     it('should return "not_allowed" when trying to enter from the back-door... :D', function(){
          let bad_bad_urls = [
              '/give_me_monaye',
              '?tutu=true',
              '/destroy_program',
              '/ping'

          ];

          bad_bad_urls.forEach(bad_url => {
              return new Promise((resolve, reject) =>{

                  let url = `${config.server+bad_url}`;

                  http.get(url, response =>{
                      response.setEncoding('utf8');

                      var response_data = [];

                      response.on('data', data => {
                        response_data.push(data);
                      });

                      response.on('end', () => {
                        var resp = JSON.parse(response_data.toString());
                        
                        if(assert.equal('not_allowed..', resp.status)) resolve();
                        else reject();
                        
                        
                      });

                      response.on('error', error => { 
                        reject(error);
                      });
                  })
              }).then(result =>{
                  console.log('ok');
              }).catch(error =>{
                  console.log(error);
              })

          })
      })
*/

 
  })


  describe('On video panel startup', function (){
      it('should display youtube video panel if the request type is youtube', function(){
          // open youtube video panel
          let payload = {
            video_type: 'youtube',
            video_url: 'https://www.youtube.com/watch?v=RWUPhKPjaBw&t=2560s'
          }

          return new Promise((resolve) =>{
            start_video_request(payload, (err, res, body) =>{
                this.app.client.windowByIndex(1).then(() =>{
                    this.app.client.getHTML('#page_id', false).then(page_id =>{
                        resolve(page_id)
                    })
                })
            })

          }).then(result =>{
              assert.equal('YOUTUBE_PAGE', result);
          })
          
      })

      it('should return status: "not_supported" when the request type is... not supported!', function(){
          // open youtube video panel
          let payload = {
            video_type: 'potato',
            video_url: 'https://www.xpotatox.com/watch?p=ahahhah'
          }

          return new Promise((resolve) =>{
            start_video_request(payload, (err, res, body) =>{
              let response = JSON.parse(body);
              resolve(response.status)
            })

          }).then(result =>{
             assert.equal('not_supported', result);
          })
          
      })

  })


}) //