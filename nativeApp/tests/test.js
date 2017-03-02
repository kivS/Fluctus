const Application = require('spectron').Application;
const path = require('path');
const assert = require('assert');


const app_path = path.join(__dirname, '..', 'main.js');

function new_app() {
  return new Application({
      path: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      args: [app_path]
    })
}

describe('Application launch', function () {
  this.timeout(60000)

  beforeEach(function () {
    this.app = new_app()
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      // Get main process logs
     /* this.app.client.getMainProcessLogs().then(function (logs) {
          logs.forEach(function (log) {
            console.log(log)
          })
      }) */

      // close app
      return this.app.stop()
 
    }
  })


  it('should get Dummy test page', function() {
      return this.app.browserWindow.getTitle().then(title =>{
         assert.equal(title, "TEST_PAGE");
      });
  })

}) //


