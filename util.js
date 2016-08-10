/**
 * Created by 姜昊 on 2016/7/22.
 */
var https = require('https');
var fs = require('fs');
var config = require('./config');
var settings = new config();

function saveData(path,data){
    fs.writeFileSync(path,JSON.stringify(data,null,4));
}

function readData(path){
    var data = fs.readFileSync(path,{encoding:'utf-8'});
    return JSON.parse(data);
}

//从微信服务器获取AccessToken并写入本地文件
function getAccessToken(next){
    var APPID = settings.APPID;
    var APPSECRET = settings.APPSECRET;
    var LINK = "https://api.weixin.qq.com/cgi-bin/token"+
        "?grant_type=client_credential&appid="+APPID+"&secret="+APPSECRET;
    https.get(encodeURI(LINK),function(res){
        var data = "";
        res.on('data',function(chunk){
            data += chunk;
        });
        res.on('end',function(){
            var result = JSON.parse(data);
            result.timeout = Date.now() + 7000000;
            saveData("data.json",result);
            next(result.access_token);
        });
    }).on('err',function(err){
        console.log("获取AccessToken出错"+err);
        return;
    });
}
function Util(){

}
Util.prototype = {
    constructor:Util,
    //sha1加密
    sha1:function(text){
        var sha1 = require('crypto').createHash('sha1');
        sha1.update(text);
        return sha1.digest('hex');
    },
    //获取本地的AccessToken
    getLocalAccessToken:function(next){
        var token;
        if(fs.existsSync('data.json')){
            token = readData('data.json');
        }
        if(!token||token.timeout<Date.now()){//不存在或者已过期
            getAccessToken(next);
        }else{
            next(token.access_token);
        }
    },
    //创建菜单
    createMenu:function(){
        this.getLocalAccessToken(function(token){
            console.log('创建菜单');
            var menu = {
                "button": [
                    {
                        "name": "功能列表",
                        "sub_button": [
                            {
                                "type": "view",
                                "name": "我要内推",
                                "url": "http://123.206.70.236:2828/pushoauth"
                            },
                            {
                                "type": "view",
                                "name": "我要实习",
                                "url": "http://123.206.70.236:2828/joblist"
                            }
                        ]
                    },
                    {
                        "name": "联系我们",
                        "sub_button": [
                            {
                                "type": "view",
                                "name": "联系反馈",
                                "url": "http://123.206.70.236:2828/help",
                                "key": "V1001_GOOD"
                            }
                        ]
                    }
                ]
            };
            var post_str = new Buffer(JSON.stringify(menu));
            var access_token = token;
            var opt = {
                host: 'api.weixin.qq.com',
                path: '/cgi-bin/menu/create?access_token=' + access_token,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_str.length
                }
            };
            var req = https.request(opt, function (response) {
                var responseText = [];
                response.setEncoding('utf8');
                response.on('data', function (data) {
                    responseText.push(data);
                });
                response.on('end', function () {
                });
            });
            req.write(post_str);
            req.end();
        });
    },
    refreshToken:function(data,next){
        console.log(data);
        var LINK = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid='+settings.APPID+'&grant_type=refresh_token&refresh_token='+data.refresh_token;
        //var LINK = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+openID+'&lang=zh_CN';
        https.get(encodeURI(LINK),function(res){
            var data = "";
            res.on('data',function(chunk){
                data += chunk;
            });
            res.on('end',function(){
                var result = JSON.parse(data);
                next(result);
            });
        }).on('err',function(err){
            console.log("刷新Token出错"+err);
            return;
        });
    },
    getUserinfo:function(openID,next){
        this.getLocalAccessToken(function(token){
            var access_token = token;
            var LINK = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+openID+'&lang=zh_CN';
            https.get(encodeURI(LINK),function(res){
                var data = "";
                res.on('data',function(chunk){
                    data += chunk;
                });
                res.on('end',function(){
                    var result = JSON.parse(data);
                    next(result);
                });
            }).on('err',function(err){
                console.log("获取用户信息出错"+err);
                return;
            });
        });
    },
    //getUserinfo:function(data,next){
    //    console.log(data);
    //        var LINK = 'https://api.weixin.qq.com/sns/userinfo?access_token='+data.access_token+'&openid='+data.openid+'&lang=zh_CN';
    //        //var LINK = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+openID+'&lang=zh_CN';
    //        https.get(encodeURI(LINK),function(res){
    //            var data = "";
    //            res.on('data',function(chunk){
    //                data += chunk;
    //            });
    //            res.on('end',function(){
    //                var result = JSON.parse(data);
    //                next(result);
    //            });
    //        }).on('err',function(err){
    //            console.log("获取用户信息出错"+err);
    //            return;
    //        });
    //},
    //根据code获取成员信息
    getUserInfoByCode:function(code,next){
        https.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+settings.APPID+'&secret='+settings.APPSECRET+'&code='+code+'&grant_type=authorization_code', function(res){
            var data = "";
            res.setEncoding('utf8');
            res.on('data', function(d){
                data+=d;
            });
            res.on('end', function () {
                next(data);
            });
        }).on('error', function(e){
            console.log('获取userId失败'+e);
        });

    }
};
module.exports = Util;
