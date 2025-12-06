
> gacp-backend@2.0.0 test
> jest --runInBand __tests__/integration/GacpGoldenLoop.test.js

  console.warn
    [jest-setup] Optional module load skipped (./config/mongodb-manager): not found

    [0m [90m 13 |[39m   } [36mcatch[39m (error) {
     [90m 14 |[39m   [36mconst[39m message [33m=[39m error [33m&&[39m error[33m.[39mcode [33m===[39m [32m'MODULE_NOT_FOUND'[39m [33m?[39m [32m'not found'[39m [33m:[39m error[33m.[39mmessage[33m;[39m
    [31m[1m>[22m[39m[90m 15 |[39m   console[33m.[39mwarn([32m`[jest-setup] Optional module load skipped (${modulePath}): ${message}`[39m)[33m;[39m
     [90m    |[39m           [31m[1m^[22m[39m
     [90m 16 |[39m     [36mreturn[39m [36mnull[39m[33m;[39m
     [90m 17 |[39m   }
     [90m 18 |[39m }[0m

      at warn (jest.setup.js:15:11)
      at Object.safeRequire (jest.setup.js:46:22)

  console.warn
    [jest-setup] Optional module load skipped (./services/redis-service): not found

    [0m [90m 13 |[39m   } [36mcatch[39m (error) {
     [90m 14 |[39m   [36mconst[39m message [33m=[39m error [33m&&[39m error[33m.[39mcode [33m===[39m [32m'MODULE_NOT_FOUND'[39m [33m?[39m [32m'not found'[39m [33m:[39m error[33m.[39mmessage[33m;[39m
    [31m[1m>[22m[39m[90m 15 |[39m   console[33m.[39mwarn([32m`[jest-setup] Optional module load skipped (${modulePath}): ${message}`[39m)[33m;[39m
     [90m    |[39m           [31m[1m^[22m[39m
     [90m 16 |[39m     [36mreturn[39m [36mnull[39m[33m;[39m
     [90m 17 |[39m   }
     [90m 18 |[39m }[0m

      at warn (jest.setup.js:15:11)
      at Object.safeRequire (jest.setup.js:47:22)

[TEST DEBUG] Starting GacpGoldenLoop test setup (Bypass Mode)...
[TEST DEBUG] Starting MongoMemoryServer...
[TEST DEBUG] MongoMemoryServer started at: mongodb://127.0.0.1:57278/
[TEST DEBUG] Connecting Mongoose directly...
[TEST DEBUG] Mongoose connected directly.
[TEST DEBUG] databaseService state updated.
[TEST DEBUG] Requiring server.js...
[33mwarn[39m: Email configuration missing - notifications will be logged only {"service":"gacp-backend","timestamp":"2025-12-06T00:59:34.267Z"}
[33mwarn[39m: No config file found at C:\Users\usEr\Documents\GitHub\GACP-Certification-Application\apps\backend\config\config.test.json, using defaults and environment variables {"service":"config","timestamp":"2025-12-06T00:59:34.482Z"}
[32minfo[39m: Configuration loaded successfully {"config":{"app":{"environment":"test","name":"Botanical Audit Framework","version":"1.0.0"},"auth":{"jwtExpiration":"24h","jwtSecret":"********","refreshTokenExpiration":"7d"},"features":{"enableAI":false,"enableQuestionnaires":true,"enableReporting":true,"enableSocketNotifications":true,"enableStandardsComparison":true,"enableTraceability":true},"logging":{"combinedLogPath":"./logs/combined.log","errorLogPath":"./logs/error.log","format":"combined","level":"info"},"modules":{"analytics":{},"farmManagement":{},"questionnaires":{},"reporting":{},"standards":{},"traceability":{}},"mongodb":{"options":{"useNewUrlParser":true,"useUnifiedTopology":true},"reconnectAttempts":5,"reconnectInterval":5000,"uri":"mongodb://127.0.0.1:57278/"},"performance":{"cacheEnabled":true,"compressionThreshold":1024,"slowRequestThreshold":1000},"redis":{"enabled":false,"ttl":86400},"server":{"host":"localhost","port":5000,"shutdownTimeout":30000},"storage":{"localPath":"./test-uploads","maxFileSize":10485760,"type":"local"}},"service":"config","timestamp":"2025-12-06T00:59:34.485Z"}
[33mwarn[39m: Cache service disabled {"service":"gacp-backend","timestamp":"2025-12-06T00:59:34.486Z"}
[32minfo[39m: Queue Service disabled in test mode {"service":"gacp-backend","timestamp":"2025-12-06T00:59:34.487Z"}
[TEST DEBUG] server.js loaded.
[TEST DEBUG] Setup complete.
(node:22368) [MONGOOSE] Warning: Duplicate schema index on {"email":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(Use `node --trace-warnings ...` to show where the warning was created)
::ffff:127.0.0.1 - - [06/Dec/2025:00:59:34 +0000] "POST /api/auth-farmer/register HTTP/1.1" 201 346 "-" "-"
::ffff:127.0.0.1 - - [06/Dec/2025:00:59:34 +0000] "POST /api/auth-farmer/login HTTP/1.1" 200 514 "-" "-"
::ffff:127.0.0.1 - - [06/Dec/2025:00:59:34 +0000] "POST /api/v2/establishments HTTP/1.1" 201 411 "-" "-"
  console.error
    [DEBUG] authenticateFarmer called. CWD: C:\Users\usEr\Documents\GitHub\GACP-Certification-Application\apps\backend

    [0m [90m 94 |[39m     require([32m'fs'[39m)[33m.[39mappendFileSync([32m'middleware_debug.log'[39m[33m,[39m [32m`[DEBUG] authenticateFarmer called at ${new Date().toISOString()}\n`[39m)[33m;[39m
     [90m 95 |[39m   } [36mcatch[39m (e) { }
    [31m[1m>[22m[39m[90m 96 |[39m   console[33m.[39merror([32m'[DEBUG] authenticateFarmer called. CWD:'[39m[33m,[39m process[33m.[39mcwd())[33m;[39m
     [90m    |[39m           [31m[1m^[22m[39m
     [90m 97 |[39m   [36mtry[39m {
     [90m 98 |[39m     [36mconst[39m authHeader [33m=[39m req[33m.[39mheaders[[32m'authorization'[39m][33m;[39m
     [90m 99 |[39m     [36mconst[39m token [33m=[39m authHeader [33m&&[39m authHeader[33m.[39msplit([32m' '[39m)[[35m1[39m][33m;[39m[0m

      at error (middleware/AuthMiddleware.js:96:11)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at next (node_modules/router/lib/route.js:157:13)
      at Route.dispatch (node_modules/router/lib/route.js:117:3)
      at handle (node_modules/router/index.js:435:11)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at node_modules/router/index.js:295:15
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at router.handle (node_modules/router/index.js:186:3)
      at router (node_modules/router/index.js:60:12)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at router.handle (node_modules/router/index.js:186:3)
      at router (node_modules/router/index.js:60:12)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at read (node_modules/body-parser/lib/read.js:43:5)
      at urlencodedParser (node_modules/body-parser/lib/types/urlencoded.js:58:5)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at node_modules/body-parser/lib/read.js:172:5
      at invokeCallback (node_modules/raw-body/index.js:238:16)
      at done (node_modules/raw-body/index.js:227:7)
      at IncomingMessage.onEnd (node_modules/raw-body/index.js:287:7)

[31merror[39m: [ApplicationRepository] create error: Application validation failed: type: `GACP_FORM_9` is not a valid enum value for path `type`., farm.owner: Path `owner` is required., farm.farmType: Path `farmType` is required., farm.area.cultivated: Path `area.cultivated` is required., farm.area.total: Path `area.total` is required., farm.coordinates.longitude: Path `coordinates.longitude` is required., farm.coordinates.latitude: Path `coordinates.latitude` is required., farm.address.postalCode: Path `address.postalCode` is required., farm.address.province: Path `address.province` is required., farm.address.district: Path `address.district` is required., farm.address.street: Path `address.street` is required. {"_message":"Application validation failed","errors":{"farm.address.district":{"kind":"required","message":"Path `address.district` is required.","name":"ValidatorError","path":"address.district","properties":{"message":"Path `address.district` is required.","path":"address.district","type":"required"}},"farm.address.postalCode":{"kind":"required","message":"Path `address.postalCode` is required.","name":"ValidatorError","path":"address.postalCode","properties":{"message":"Path `address.postalCode` is required.","path":"address.postalCode","type":"required"}},"farm.address.province":{"kind":"required","message":"Path `address.province` is required.","name":"ValidatorError","path":"address.province","properties":{"message":"Path `address.province` is required.","path":"address.province","type":"required"}},"farm.address.street":{"kind":"required","message":"Path `address.street` is required.","name":"ValidatorError","path":"address.street","properties":{"message":"Path `address.street` is required.","path":"address.street","type":"required"}},"farm.area.cultivated":{"kind":"required","message":"Path `area.cultivated` is required.","name":"ValidatorError","path":"area.cultivated","properties":{"message":"Path `area.cultivated` is required.","path":"area.cultivated","type":"required"}},"farm.area.total":{"kind":"required","message":"Path `area.total` is required.","name":"ValidatorError","path":"area.total","properties":{"message":"Path `area.total` is required.","path":"area.total","type":"required"}},"farm.coordinates.latitude":{"kind":"required","message":"Path `coordinates.latitude` is required.","name":"ValidatorError","path":"coordinates.latitude","properties":{"message":"Path `coordinates.latitude` is required.","path":"coordinates.latitude","type":"required"}},"farm.coordinates.longitude":{"kind":"required","message":"Path `coordinates.longitude` is required.","name":"ValidatorError","path":"coordinates.longitude","properties":{"message":"Path `coordinates.longitude` is required.","path":"coordinates.longitude","type":"required"}},"farm.farmType":{"kind":"required","message":"Path `farmType` is required.","name":"ValidatorError","path":"farmType","properties":{"message":"Path `farmType` is required.","path":"farmType","type":"required"}},"farm.owner":{"kind":"required","message":"Path `owner` is required.","name":"ValidatorError","path":"owner","properties":{"message":"Path `owner` is required.","path":"owner","type":"required"}},"type":{"kind":"enum","message":"`GACP_FORM_9` is not a valid enum value for path `type`.","name":"ValidatorError","path":"type","properties":{"enumValues":["NEW","RENEWAL"],"length":11,"message":"`GACP_FORM_9` is not a valid enum value for path `type`.","path":"type","type":"enum","value":"GACP_FORM_9"},"value":"GACP_FORM_9"}},"service":"gacp-backend","stack":"ValidationError: Application validation failed: type: `GACP_FORM_9` is not a valid enum value for path `type`., farm.owner: Path `owner` is required., farm.farmType: Path `farmType` is required., farm.area.cultivated: Path `area.cultivated` is required., farm.area.total: Path `area.total` is required., farm.coordinates.longitude: Path `coordinates.longitude` is required., farm.coordinates.latitude: Path `coordinates.latitude` is required., farm.address.postalCode: Path `address.postalCode` is required., farm.address.province: Path `address.province` is required., farm.address.district: Path `address.district` is required., farm.address.street: Path `address.street` is required.\n    at model.Object.<anonymous>.Document.invalidate (C:\\Users\\usEr\\Documents\\GitHub\\GACP-Certification-Application\\apps\\backend\\node_modules\\mongoose\\lib\\document.js:3362:32)\n    at C:\\Users\\usEr\\Documents\\GitHub\\GACP-Certification-Application\\apps\\backend\\node_modules\\mongoose\\lib\\document.js:3123:17\n    at C:\\Users\\usEr\\Documents\\GitHub\\GACP-Certification-Application\\apps\\backend\\node_modules\\mongoose\\lib\\schemaType.js:1446:9\n    at processTicksAndRejections (node:internal/process/task_queues:85:11)","timestamp":"2025-12-06T00:59:34.969Z"}
[31merror[39m: Error creating GACP application {"error":"Application validation failed: type: `GACP_FORM_9` is not a valid enum value for path `type`., farm.owner: Path `owner` is required., farm.farmType: Path `farmType` is required., farm.area.cultivated: Path `area.cultivated` is required., farm.area.total: Path `area.total` is required., farm.coordinates.longitude: Path `coordinates.longitude` is required., farm.coordinates.latitude: Path `coordinates.latitude` is required., farm.address.postalCode: Path `address.postalCode` is required., farm.address.province: Path `address.province` is required., farm.address.district: Path `address.district` is required., farm.address.street: Path `address.street` is required.","farmerId":"69337ff6afde585af46a939e","service":"gacp-backend","timestamp":"2025-12-06T00:59:34.970Z"}
::ffff:127.0.0.1 - - [06/Dec/2025:00:59:34 +0000] "POST /api/v2/applications HTTP/1.1" 400 697 "-" "-"
  console.error
    Draft Application Failed: {
      "success": false,
      "error": "Application validation failed: type: `GACP_FORM_9` is not a valid enum value for path `type`., farm.owner: Path `owner` is required., farm.farmType: Path `farmType` is required., farm.area.cultivated: Path `area.cultivated` is required., farm.area.total: Path `area.total` is required., farm.coordinates.longitude: Path `coordinates.longitude` is required., farm.coordinates.latitude: Path `coordinates.latitude` is required., farm.address.postalCode: Path `address.postalCode` is required., farm.address.province: Path `address.province` is required., farm.address.district: Path `address.district` is required., farm.address.street: Path `address.street` is required."
    }

    [0m [90m 214 |[39m
     [90m 215 |[39m         [36mif[39m (draftRes[33m.[39mstatus [33m!==[39m [35m201[39m) {
    [31m[1m>[22m[39m[90m 216 |[39m             console[33m.[39merror([32m'Draft Application Failed:'[39m[33m,[39m [33mJSON[39m[33m.[39mstringify(draftRes[33m.[39mbody[33m,[39m [36mnull[39m[33m,[39m [35m2[39m))[33m;[39m
     [90m     |[39m                     [31m[1m^[22m[39m
     [90m 217 |[39m         }
     [90m 218 |[39m         expect(draftRes[33m.[39mstatus)[33m.[39mtoBe([35m201[39m)[33m;[39m
     [90m 219 |[39m         applicationId [33m=[39m draftRes[33m.[39mbody[33m.[39mdata[33m.[39mid [33m||[39m draftRes[33m.[39mbody[33m.[39mdata[33m.[39m_id [33m||[39m draftRes[33m.[39mbody[33m.[39mdata[33m.[39mapplicationId[33m;[39m[0m

      at Object.error (__tests__/integration/GacpGoldenLoop.test.js:216:21)

[32minfo[39m: Disconnected from MongoDB {"service":"gacp-backend","timestamp":"2025-12-06T00:59:34.994Z"}
FAIL __tests__/integration/GacpGoldenLoop.test.js
  🎯 GACP Golden Loop (Corrected Workflow)
    × should complete the full GACP workflow successfully (473 ms)
System.Management.Automation.RemoteException
  ● 🎯 GACP Golden Loop (Corrected Workflow) › should complete the full GACP workflow successfully
System.Management.Automation.RemoteException
    expect(received).toBe(expected) // Object.is equality
System.Management.Automation.RemoteException
    Expected: 201
    Received: 400
System.Management.Automation.RemoteException
    [0m [90m 216 |[39m             console[33m.[39merror([32m'Draft Application Failed:'[39m[33m,[39m [33mJSON[39m[33m.[39mstringify(draftRes[33m.[39mbody[33m,[39m [36mnull[39m[33m,[39m [35m2[39m))[33m;[39m
     [90m 217 |[39m         }
    [31m[1m>[22m[39m[90m 218 |[39m         expect(draftRes[33m.[39mstatus)[33m.[39mtoBe([35m201[39m)[33m;[39m
     [90m     |[39m                                 [31m[1m^[22m[39m
     [90m 219 |[39m         applicationId [33m=[39m draftRes[33m.[39mbody[33m.[39mdata[33m.[39mid [33m||[39m draftRes[33m.[39mbody[33m.[39mdata[33m.[39m_id [33m||[39m draftRes[33m.[39mbody[33m.[39mdata[33m.[39mapplicationId[33m;[39m
     [90m 220 |[39m         console[33m.[39mlog([32m`✅ Application Drafted: ${applicationId}`[39m)[33m;[39m
     [90m 221 |[39m[0m
System.Management.Automation.RemoteException
      at Object.toBe (__tests__/integration/GacpGoldenLoop.test.js:218:33)
System.Management.Automation.RemoteException
Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        2.703 s, estimated 3 s
Ran all test suites matching /__tests__\\integration\\GacpGoldenLoop.test.js/i.
[32minfo[39m: Loaded MongoDB config from app-config.json {"service":"mongodb","timestamp":"2025-12-06T00:59:36.046Z"}
[32minfo[39m: MongoDB manager initialized with URI: mongodb+srv://gacp-premierprime:******@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin {"service":"mongodb","timestamp":"2025-12-06T00:59:36.047Z"}
