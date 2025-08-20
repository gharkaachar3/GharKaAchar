const { createClient }  = require('redis') ;

const redisClient = createClient({
    username: 'default',
    password: 'PO2XOXvXuyb8oAc7SIlV9mGY0m34UFcf',
    socket: {
       host: 'redis-14916.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 14916
    }
});

module.exports = redisClient;
