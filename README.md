# floating-dog Project

## Versioning
  - YYYY-M-1N(N = montly update counter)

## Global Configs:
* Ports in use:
      * 8791
      * 8238
      * 8753

## Native Desktop App

### Configs

* **Supported video_type list:**
   -   ```javascript
       SUPPORTED_REQUESTS: ['youtube']

        ```

### API

  * **ping:**
      - Launches Pings native app local server
      - Method: GET
      - Payload: None
      - On success returns:
        ```json
        { "status": "alive"}

        ```


  * **start_video:**
      - Launches video panel with with payload
      - Method: POST
      - Payload: video_type, rest of Object
      - On success returns:
        ```json
        { "status": "ok"}

        ```

  * **Errors:**
      - On requests to local server that are not allowed:
      ```json
        { "status": "not_allowed.."}

      ```

      - On open video panels where video_type is not supported:
       ```json
        { "status": "not_supported"}

      ```
