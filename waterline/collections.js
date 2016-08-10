/**
 * Created by 姜昊 on 2016/7/22.
 */
/**
 * Created by 姜昊 on 2016/5/9.
 */
var waterline = require('waterline');

var job = waterline.Collection.extend({
    identity:'job',
    connection:'mysql',
    schema:true,
    migrate: 'safe',
    autoCreatedAt:false,
    autoUpdatedAt:false,
    attributes: {
        company: {
            type: 'string',
        },
        jobname: {
            type: 'string',
        },
        city: {
            type: 'string',
        },
        time: {
            type: 'string',
        },
        peroid: {
            type: 'string',
        },
        salary: {
            type: 'string',
        },
        intro: {
            type: 'string',
        },
        submission_time: {
            type: 'string',
        },
        submission_id: {
            type: 'string',
        }
    }
});

exports.job=job;