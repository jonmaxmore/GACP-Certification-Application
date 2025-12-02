/**
 * GACP Platform - Atlas MongoDB Server
 * Entry point for the backend application
 *
 * Refactored to use Class-based Architecture
 *
 * @author GACP Platform Team
 * @version 2.0.0
 */

const Server = require('./src/core/Server');

// Start the server only when executing this file directly
if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;
