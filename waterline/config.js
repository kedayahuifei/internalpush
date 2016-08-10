
/**
 * Created by 姜昊 on 2016/7/22.
 */

var mysqlAdapter = require('sails-mysql');
var adapters={
    mysql:mysqlAdapter,
    default:'mysql'
};

var connections ={
    mysql:{
        adapter:'mysql',
        url:"mysql://root:haoting521@123.206.70.236/internalpush"
    }
};
var config = {
    adapters:adapters,
    connections:connections
};
exports.config = config;