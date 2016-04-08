/**
 * Created by laodao on 16/3/29.
 *
 */
var ip  = "127.0.0.1";
var sys = require('sys')
var oldExec = require('child_process').exec;

function exec(content){
        return new Promise(function (resolve, reject) {
            console.log(content);
            oldExec(content, function (error, stdout, stderr) {
                if (error !== null) {
                    return reject(error);
                }
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                resolve({
                    stdout:stdout,
                    stderr:stderr
                });
            });

        });
}

exports.index = function* (next) {
    yield this.render('index', {
    });
};

exports.new = function* (next) {
    yield this.render('new', {
    });
};

exports.list = function* (next) {
    var docker =  this.mongo('Docker');
    var aesList = yield docker.list("aes-128-cbc对称加密解密");
    var rsaList = yield docker.list("RSA非对称加密解密");
    var ssList = yield docker.list("ShadowSocks");
    yield this.render('list',{
        aesList:aesList,
        rsaList:rsaList,
        ssList:ssList
    });
};

exports.info = function* (next) {
    yield this.render('info', {
    });
};

exports.add = function* (){
    var post = this.request.body;
    post.configs = {};
    if(post.type == "ShadowSocks"){
        post.configs.port = post.port;
        post.port = undefined;
        post.configs.password = post.password;
        post.password = undefined;
    }else{
        post.configs.port = post.port;
        post.port = undefined;
    }
    post.configs.ip = ip;
    var docker =  this.mongo('Docker',post);
    var newCreateDockerExec = "docker  run --name="+docker._id+" -d -p "+post.configs.port+":"+post.configs.port+" oddrationale/docker-shadowsocks -s 0.0.0.0 -p "+post.configs.port+" -k "+post.configs.password+" -m aes-256-cfb";
    var execResult = yield exec(newCreateDockerExec);
    console.log(execResult);
    try{
        var info = yield docker.save();
    }catch (err){
        console.log(err);
    }
    this.redirect('/list');
}

exports.delete = function* (){
    var id = this.request.query.id;
    var docker =  this.mongo('Docker');
    var rmDockerExec = "docker rm "+id;
    var execResult = yield exec(rmDockerExec);
    console.log(execResult);
    yield docker.deleteById(id);
    this.redirect('/list');
}

exports.content = function* (){
    var id = this.request.query.id;
    var docker =  this.mongo('Docker');
    var content = yield docker.findById(id);
    console.log(content);
    if(content.type == "ShadowSocks"){
        yield this.render('ShadowSocks', {
            content : content
        });
    }else{
        yield this.render('jiajiemi', {
            content : content
        });
    }

}

exports.dockerstart = function* (){
    var id = this.request.query.id;
    var startDockerExec = "docker start "+id;
    var execResult = yield exec(startDockerExec);
    console.log(execResult);
    yield this.render('golist', {
        info : "已经开启："+id+"容器"
    });
}

exports.dockerstop = function* (){
    var id = this.request.query.id;
    var stopDockerExec = "docker stop "+id;
    var execResult = yield exec(stopDockerExec);
    console.log(execResult);
    yield this.render('golist', {
        info : "已经关闭：" +id+"容器"
    });
}