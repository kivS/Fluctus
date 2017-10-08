# Fluctus Project
  

---

## Native Desktop App

### Structure
  - main.ts implements http server, global logging, auto-update, notifications, player panel positioning in screen
  - on http call from web extension, main.ts starts a renderer process to display player panel(player depends on request. eg: youtube player)
  - the player panel process has no access to node api and communicates with the main process via a preload script 
  - the preload script implements pre-defined main resources the player panel can access to 


### Versioning
  - YYYY-M-1N(N = montly update counter, initial value 00)

### Global Configs:
  * Ports in use:
      * 8791
      * 8238
      * 8753


### Configs
  * **Supported player_type list:**
   -   ```javascript
       SUPPORTED_REQUESTS: ['youtube']

        ```

### Main HTTP API

  * **ping:**
      - Launches Pings native app local server
      - Method: GET
      - Payload: None
      - On success returns:
        ```json
        { "status": "alive"}

        ```


  * **start_player:**
      - Launches player panel with player_type
      - Method: POST
      - Payload: player_type, rest of Object
      - On success returns:
        ```json
        { "status": "ok"}

        ```

  * **Errors:**
      - On requests to local server that are not allowed:
      ```json
        { "status": "not_allowed.."}

      ```

      - On open player panel where player_type is not supported:
       ```json
        { "status": "not_supported!"}

      ```

       - On open player panel where player_type is not present:
       ```json
        { "status": "player_type not present.."}

      ```


### Video/Audio Players API
  - Transport: Json

> Youtube
    - player_type        --> String | eg: youtube
    - video_currentTime --> Number
    - video_url         --> Url    | String enconded url object
    - video_url:
        - list --> playlist id
        - v    --> video id


    

---


## Chrome Extension