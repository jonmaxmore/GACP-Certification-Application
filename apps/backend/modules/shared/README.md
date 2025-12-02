# 🔧 Shared Module

## Purpose

ทรัพยากรและ utilities ที่ใช้ร่วมกันทุก module ใน GACP Platform

## Structure

```
shared/
├── config/              # Configuration files
│   ├── environment.js   # Environment variables
│   └── database.js      # Database config
├── middleware/          # Express middleware
│   ├── error-handler.js # Global error handler
│   ├── auth.js          # Authentication middleware
│   └── security.js      # Security middleware
├── utils/               # Utility functions
│   ├── response.js      # Standard response format
│   ├── validation.js    # Validation helpers
│   ├── crypto.js        # Password hashing, tokens
│   └── date.js          # Date formatting
├── constants/           # Application constants
│   ├── status-codes.js  # HTTP status codes
│   ├── user-roles.js    # User roles & permissions
│   └── error-messages.js # Error messages
├── database/            # Database management
│   ├── connection.js    # MongoDB connection
│   └── mongoose-plugins.js # Common plugins
├── README.md
└── index.js             # Module entry point
```

## Usage

### Import shared module

```javascript
const shared = require('../shared');

// Config
const { environment, database } = shared.config;
console.log('Port:', environment.port);

// Middleware
app.use(shared.middleware.errorHandler);

// Utils
const { successResponse, errorResponse } = shared.utils.response;
successResponse(res, data, 'Success');

// Constants
const { FARMER, DTAM_ADMIN } = shared.constants.userRoles;

// Database
await shared.database.connection.connect();
```

### Response Utils

```javascript
const { successResponse, errorResponse, notFoundResponse } = shared.utils.response;

// Success response
successResponse(res, userData, 'User created successfully', 201);

// Error response
errorResponse(res, 'Invalid input', 400);

// Not found response
notFoundResponse(res, 'User');
```

### Validation Utils

```javascript
const { isValidEmail, isStrongPassword, isEmpty } = shared.utils.validation;

if (!isValidEmail(email)) {
  return errorResponse(res, 'Invalid email format', 400);
}

if (!isStrongPassword(password)) {
  return errorResponse(res, 'Password too weak', 400);
}
```

### Crypto Utils

```javascript
const { hashPassword, comparePassword, generateToken } = shared.utils.crypto;

// Hash password
const hashedPassword = await hashPassword('Password123!');

// Compare password
const isMatch = await comparePassword('Password123!', hashedPassword);

// Generate token
const verificationToken = generateToken(32);
```

### Constants

```javascript
const { statusCodes, userRoles, errorMessages } = shared.constants;

// HTTP status codes
res.status(statusCodes.OK).json({ success: true });

// User roles
if (user.role === userRoles.FARMER) {
  // Farmer logic
}

// Error messages
errorResponse(res, errorMessages.INVALID_CREDENTIALS, 401);
```

### Database Connection

```javascript
const dbConnection = shared.database.connection;

// Connect to MongoDB
await dbConnection.connect();

// Get connection status
const isConnected = dbConnection.getStatus();

// Get database stats
const stats = await dbConnection.getStats();
```

### Mongoose Plugins

```javascript
const { timestampPlugin, softDeletePlugin, paginationPlugin } = shared.database.plugins;

// Apply to model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

userSchema.plugin(timestampPlugin);
userSchema.plugin(softDeletePlugin);
userSchema.plugin(paginationPlugin);

// Use pagination
const result = await User.paginate({ role: 'farmer' }, { page: 1, limit: 10 });
```

## Dependencies

All modules depend on this shared module for:

- ✅ Configuration management
- ✅ Standard response format
- ✅ Validation helpers
- ✅ Error handling
- ✅ Database connection
- ✅ Common utilities

## Status

✅ Complete - All shared resources ready
