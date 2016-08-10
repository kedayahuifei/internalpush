/**
 * Created by 姜昊 on 2016/7/22.
 */
var waterline= require('waterline');
var job = require('./collections').job;

var orm = new waterline();
orm.loadCollection(job);

exports.orm = orm;