/**
 * Created by 姜昊 on 2016/7/22.
 */
var express = require('express');
var path = require('path');
var config = require('./config');
var session = require('express-session');
var app = express();
var bodyParser  = require('body-parser');

var xmlparser = require('express-xml-bodyparser');
var xml_Parse = require('xml2js').parseString;

var Util = require('./util');
var util = new Util();
var settings = new config();
var moment=require('moment');
var wxqiyehao = require("wechat-crypto")

//数据库初始化
var w_config = require('./waterline/config').config;
var w_orm    =  require('./waterline/instance').orm;
var Job;
w_orm.initialize(w_config,function(err,models){
    if(err) throw err;
    console.log("database initialize success");
    Job = models.collections.job;
});

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(session({
    secret:'1234',
    name:'internalpush',
    cookie:{maxAge :1000*60*20},
    resave :false,
    saveUninitialized :true
}));
util.createMenu();
function checkSignatur(params,token){
    var key =[token,params.timestamp,params.nonce].sort().join('');
    var sha1 = require('crypto').createHash('sha1');
    sha1.update(key);
    return sha1.digest('hex') == params.signature;
}

app.get('/pushoauth', function(req, res) {
    var redirect_uri = "http://123.206.70.236:2828/push";
    res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+settings.APPID+"&redirect_uri="+redirect_uri+"&response_type=code&scope=snsapi_base#wechat_redirect");

});
app.get('/push', function(req, res) {
    var query = require('url').parse(req.url).query;
    var params = require('qs').parse(query);
    var code  = params.code||"";
        util.getUserInfoByCode(code,function(data){
                var openid=JSON.parse(data).openid;
                util.getUserinfo(openid,function(userinfo){
                    console.log("用户信息");
                    req.session.user=userinfo;
                    res.render('push',{title:'实习内推'});
                });
            });
});
//内推post请求，将内推信息存进数据库
app.post('/push', function(req, res) {

    var company = req.body.company,
        jobname = req.body.job,
        city = req.body.city,
        time = req.body.time,
        peroid = req.body.peroid,
        salary = req.body.salary,
        intro = req.body.intro;
    var submission_time =moment().format("YYYY-MM-DD HH:mm:ss");

    switch(time){
        case '1':
            time='不限';
            break;
        case '2':
            time='1天/周';
            break;
        case '3':
            time='2天/周';
            break;
        case '4':
            time='3天/周';
            break;
        case '5':
            time='4天/周';
            break;
        case '6':
            time='5天/周';
            break;
        case '7':
            time='6天/周';
            break;
        case '8':
            time='7天/周';
            break;
        default:
            time='不限';
            break;
    }
    switch(peroid){
        case '1':
            peroid='不限';
            break;
        case '2':
            peroid='实习3个月';
            break;
        case '3':
            peroid='实习3-6个月';
            break;
        case '4':
            peroid='实习6个月';
            break;
            break;
        default:
            peroid='不限';
            break;
    }
    switch(salary){
        case '1':
            salary='100/天以下';
            break;
        case '2':
            salary='100/天以下';
            break;
        case '3':
            salary='100-200/天';
            break;
        case '4':
            salary='200-300/天';
            break;
        case '5':
            salary='300-400/天';
            break;
        case '6':
            salary='400/天以上';
            break;
        default:
            salary='100/天以下';
            break;
    }
    console.log(jobname);
    console.log(req.session.user.nickname);
    Job.create({ company:company,
        jobname:jobname,
        city: city ,
        time:time,
        peroid:peroid,
        salary:salary,
        intro:intro,
        submission_time:submission_time,
        submission_id:"123456"
        }).exec(function(err, newuser) {
            if(err){
                console.log(err);
            }
        if(newuser!=null)
            console.log('push success');
        });
    res.render('tip');
});
app.get('/help', function(req, res) {
    res.render('help');
});
app.get('/joblist', function(req, res) {
    Job.query('SELECT * FROM job',function(err,results){
        var joblist=[];
        for(var i= 0,total=results.length;i<total;i++)
            joblist.unshift(results[i]);
        res.render('joblist',{title:'我要实习',joblist:joblist});
    });
});
app.get('/detail/:id', function(req, res) {
    var  jobid = req.params.id;
    console.log(jobid)
    Job.findOne({id:jobid}).exec(function(err,result){
        console.log(result);
        res.render('jobdetail',{title:'实习详情',job:result});
    });
});

//app.get('/',function(req,res){
//  console.log('get');
//  var query = require('url').parse(req.url).query;
//  var params = require('qs').parse(query);
//  var signature = params.signature||"";
//  var timestamp = params.timestamp||"";
//  var nonce = params.nonce||"";
//  var echostr = params.echostr||"";
//  if(signature!==""&&timestamp!==""&&nonce!==""&&echostr!==""){
//    console.log('验证签名');
//    if(!processor.checkSignature(params, settings.TOKEN)){//签名错误
//      res.end('signature fail');
//    }else{
//      res.end(params.echostr);
//    }
//  }else{
//    res.cookie('openid', openid, {maxAge: 1000*60*60*24*7});
//    console.log(openid);
//    res.render('index',{title:'邮箱绑定'});
//  }
//});
//
//app.post('/',xmlparser({trim: false, explicitArray: false}),function(req,res,next){
//  console.log(req.body);
//  openid=req.body.xml.fromusername;
//  res.end("");
//});
app.listen(settings.PORT,function(req,res){
    console.log("Server runing at port: " + settings.PORT);
});