try {
    console.log('Checking index.js...');
    require('./routes/api/index.js');
    console.log('Checking applications.js...');
    require('./routes/api/applications.js');
    console.log('Checking webhooks.js...');
    require('./routes/api/webhooks.js');
    console.log('Checking payment-controller.js...');
    require('./controllers/payment-controller.js');
    console.log('All files required successfully.');
} catch (error) {
    console.error('Syntax/Runtime Error detected:');
    console.error(error);
}
