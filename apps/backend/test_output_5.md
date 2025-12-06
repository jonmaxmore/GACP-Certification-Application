
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
[TEST DEBUG] MongoMemoryServer started at: mongodb://127.0.0.1:63483/
[TEST DEBUG] Connecting Mongoose directly...
[TEST DEBUG] Mongoose connected directly.
[TEST DEBUG] databaseService state updated.
[TEST DEBUG] Requiring server.js...
[33mwarn[39m: Email configuration missing - notifications will be logged only {"service":"gacp-backend","timestamp":"2025-12-06T01:02:42.256Z"}
[33mwarn[39m: No config file found at C:\Users\usEr\Documents\GitHub\GACP-Certification-Application\apps\backend\config\config.test.json, using defaults and environment variables {"service":"config","timestamp":"2025-12-06T01:02:42.468Z"}
[32minfo[39m: Configuration loaded successfully {"config":{"app":{"environment":"test","name":"Botanical Audit Framework","version":"1.0.0"},"auth":{"jwtExpiration":"24h","jwtSecret":"********","refreshTokenExpiration":"7d"},"features":{"enableAI":false,"enableQuestionnaires":true,"enableReporting":true,"enableSocketNotifications":true,"enableStandardsComparison":true,"enableTraceability":true},"logging":{"combinedLogPath":"./logs/combined.log","errorLogPath":"./logs/error.log","format":"combined","level":"info"},"modules":{"analytics":{},"farmManagement":{},"questionnaires":{},"reporting":{},"standards":{},"traceability":{}},"mongodb":{"options":{"useNewUrlParser":true,"useUnifiedTopology":true},"reconnectAttempts":5,"reconnectInterval":5000,"uri":"mongodb://127.0.0.1:63483/"},"performance":{"cacheEnabled":true,"compressionThreshold":1024,"slowRequestThreshold":1000},"redis":{"enabled":false,"ttl":86400},"server":{"host":"localhost","port":5000,"shutdownTimeout":30000},"storage":{"localPath":"./test-uploads","maxFileSize":10485760,"type":"local"}},"service":"config","timestamp":"2025-12-06T01:02:42.471Z"}
[33mwarn[39m: Cache service disabled {"service":"gacp-backend","timestamp":"2025-12-06T01:02:42.473Z"}
[32minfo[39m: Queue Service disabled in test mode {"service":"gacp-backend","timestamp":"2025-12-06T01:02:42.474Z"}
[TEST DEBUG] server.js loaded.
[TEST DEBUG] Setup complete.
(node:19724) [MONGOOSE] Warning: Duplicate schema index on {"email":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(Use `node --trace-warnings ...` to show where the warning was created)
::ffff:127.0.0.1 - - [06/Dec/2025:01:02:42 +0000] "POST /api/auth-farmer/register HTTP/1.1" 201 346 "-" "-"
::ffff:127.0.0.1 - - [06/Dec/2025:01:02:42 +0000] "POST /api/auth-farmer/login HTTP/1.1" 200 514 "-" "-"
::ffff:127.0.0.1 - - [06/Dec/2025:01:02:42 +0000] "POST /api/v2/establishments HTTP/1.1" 201 411 "-" "-"
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

[32minfo[39m: GACP application created {"applicationId":"693380b23b5d2e03091061df","applicationNumber":"APP-20251206-9638","farmerId":"693380b23b5d2e03091061ca","riskLevel":"low","service":"gacp-backend","timestamp":"2025-12-06T01:02:42.972Z"}
::ffff:127.0.0.1 - - [06/Dec/2025:01:02:42 +0000] "POST /api/v2/applications HTTP/1.1" 200 68 "-" "-"
::ffff:127.0.0.1 - - [06/Dec/2025:01:02:42 +0000] "GET /api/v2/applications/693380b23b5d2e03091061df/review HTTP/1.1" 404 190 "-" "-"
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
      at param (node_modules/router/index.js:600:14)
      at param (node_modules/router/index.js:610:14)
      at processParams (node_modules/router/index.js:664:3)
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
      at read (node_modules/body-parser/lib/read.js:54:5)
      at urlencodedParser (node_modules/body-parser/lib/types/urlencoded.js:58:5)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at read (node_modules/body-parser/lib/read.js:54:5)
      at jsonParser (node_modules/body-parser/lib/types/json.js:90:5)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at logger (node_modules/morgan/index.js:144:5)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at compression (node_modules/compression/index.js:243:5)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at cors (node_modules/cors/lib/index.js:188:7)
      at node_modules/cors/lib/index.js:224:17
      at originCallback (node_modules/cors/lib/index.js:214:15)
      at node_modules/cors/lib/index.js:219:13
      at optionsCallback (node_modules/cors/lib/index.js:199:9)
      at corsMiddleware (node_modules/cors/lib/index.js:204:7)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at internalNext (node_modules/helmet/index.cjs:537:6)
      at xXssProtectionMiddleware (node_modules/helmet/index.cjs:315:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at xPoweredByMiddleware (node_modules/helmet/index.cjs:308:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at xPermittedCrossDomainPoliciesMiddleware (node_modules/helmet/index.cjs:301:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at xFrameOptionsMiddleware (node_modules/helmet/index.cjs:285:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at xDownloadOptionsMiddleware (node_modules/helmet/index.cjs:265:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at xDnsPrefetchControlMiddleware (node_modules/helmet/index.cjs:258:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at xContentTypeOptionsMiddleware (node_modules/helmet/index.cjs:250:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at strictTransportSecurityMiddleware (node_modules/helmet/index.cjs:243:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at referrerPolicyMiddleware (node_modules/helmet/index.cjs:211:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at originAgentClusterMiddleware (node_modules/helmet/index.cjs:186:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at crossOriginResourcePolicyMiddleware (node_modules/helmet/index.cjs:179:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at crossOriginOpenerPolicyMiddleware (node_modules/helmet/index.cjs:163:3)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at contentSecurityPolicyMiddleware (node_modules/helmet/index.cjs:128:4)
      at internalNext (node_modules/helmet/index.cjs:535:6)
      at helmetMiddleware (node_modules/helmet/index.cjs:539:6)
      at Layer.handleRequest (node_modules/router/lib/layer.js:152:17)
      at trimPrefix (node_modules/router/index.js:342:13)
      at node_modules/router/index.js:297:9
      at processParams (node_modules/router/index.js:582:12)
      at next (node_modules/router/index.js:291:5)
      at router.handle (node_modules/router/index.js:186:3)
      at app.handle (node_modules/express/lib/application.js:177:15)

::ffff:127.0.0.1 - - [06/Dec/2025:01:02:43 +0000] "GET /api/v2/applications/693380b23b5d2e03091061df HTTP/1.1" 200 183 "-" "-"
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
      at node_modules/router/index.js:688:15
      at next (node_modules/router/index.js:276:14)
      at Layer.handleRequest (node_modules/router/lib/layer.js:147:12)
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

[32minfo[39m: Processing payment confirmation for app 693380b23b5d2e03091061df, phase phase1 {"service":"gacp-backend","timestamp":"2025-12-06T01:02:43.019Z"}
[32minfo[39m: Payment processed for application 693380b23b5d2e03091061df phase phase1 {"service":"gacp-backend","timestamp":"2025-12-06T01:02:43.038Z","transactionId":"TXN-1764982963026"}
::ffff:127.0.0.1 - - [06/Dec/2025:01:02:43 +0000] "POST /api/v2/payments HTTP/1.1" 200 403 "-" "-"
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
      at param (node_modules/router/index.js:600:14)
      at param (node_modules/router/index.js:610:14)
      at processParams (node_modules/router/index.js:664:3)
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

[31merror[39m: Error submitting application {"applicationId":"693380b23b5d2e03091061df","error":"Application validation failed: status: `submitted` is not a valid enum value for path `status`., workflowHistory.0.actor: Path `actor` is required.","service":"gacp-backend","timestamp":"2025-12-06T01:02:43.076Z"}
::ffff:127.0.0.1 - - [06/Dec/2025:01:02:43 +0000] "POST /api/v2/applications/693380b23b5d2e03091061df/submit HTTP/1.1" 400 175 "-" "-"
  console.error
    Submit Failed: {
      "success": false,
      "error": "Application validation failed: status: `submitted` is not a valid enum value for path `status`., workflowHistory.0.actor: Path `actor` is required."
    }

    [0m [90m 320 |[39m
     [90m 321 |[39m         [36mif[39m (submitRes[33m.[39mstatus [33m!==[39m [35m200[39m) {
    [31m[1m>[22m[39m[90m 322 |[39m             console[33m.[39merror([32m'Submit Failed:'[39m[33m,[39m [33mJSON[39m[33m.[39mstringify(submitRes[33m.[39mbody[33m,[39m [36mnull[39m[33m,[39m [35m2[39m))[33m;[39m
     [90m     |[39m                     [31m[1m^[22m[39m
     [90m 323 |[39m         }
     [90m 324 |[39m         expect(submitRes[33m.[39mstatus)[33m.[39mtoBe([35m200[39m)[33m;[39m
     [90m 325 |[39m         console[33m.[39mlog([32m'✅ Application Submitted'[39m)[33m;[39m[0m

      at Object.error (__tests__/integration/GacpGoldenLoop.test.js:322:21)

[32minfo[39m: Disconnected from MongoDB {"service":"gacp-backend","timestamp":"2025-12-06T01:02:43.098Z"}
FAIL __tests__/integration/GacpGoldenLoop.test.js
  🎯 GACP Golden Loop (Corrected Workflow)
    × should complete the full GACP workflow successfully (595 ms)
System.Management.Automation.RemoteException
  ● 🎯 GACP Golden Loop (Corrected Workflow) › should complete the full GACP workflow successfully
System.Management.Automation.RemoteException
    expect(received).toBe(expected) // Object.is equality
System.Management.Automation.RemoteException
    Expected: 200
    Received: 400
System.Management.Automation.RemoteException
    [0m [90m 322 |[39m             console[33m.[39merror([32m'Submit Failed:'[39m[33m,[39m [33mJSON[39m[33m.[39mstringify(submitRes[33m.[39mbody[33m,[39m [36mnull[39m[33m,[39m [35m2[39m))[33m;[39m
     [90m 323 |[39m         }
    [31m[1m>[22m[39m[90m 324 |[39m         expect(submitRes[33m.[39mstatus)[33m.[39mtoBe([35m200[39m)[33m;[39m
     [90m     |[39m                                  [31m[1m^[22m[39m
     [90m 325 |[39m         console[33m.[39mlog([32m'✅ Application Submitted'[39m)[33m;[39m
     [90m 326 |[39m
     [90m 327 |[39m         [90m// ============================================[39m[0m
System.Management.Automation.RemoteException
      at Object.toBe (__tests__/integration/GacpGoldenLoop.test.js:324:34)
System.Management.Automation.RemoteException
Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        2.839 s, estimated 3 s
Ran all test suites matching /__tests__\\integration\\GacpGoldenLoop.test.js/i.
[32minfo[39m: Loaded MongoDB config from app-config.json {"service":"mongodb","timestamp":"2025-12-06T01:02:44.147Z"}
[32minfo[39m: MongoDB manager initialized with URI: mongodb+srv://gacp-premierprime:******@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin {"service":"mongodb","timestamp":"2025-12-06T01:02:44.152Z"}
