'use strict';
var config = require('../config/config');

const path = require('path'),
    koa = require('koa'),
    router = require('koa-router')(),
    logger = require('koa-logger'),
    gzip = require('koa-gzip'),
    views = require('koa-views'),
    mount = require('koa-mount'),
    bodyparser = require('koa-bodyparser'),
    koastatic = require('koa-static'),
    routes = require('../app/routes/index'),
    mongo = require("../middleware/mongo");

let app = koa();

// gzip
app.use(gzip());

//日志
app.use(logger());

// 配置静态文件路由
app.use(mount('/static', koastatic(__dirname + '/../app/static')));

// bodyparser
app.use(bodyparser({
    formLimit:'5mb'
}));

// Views
app.use(views(__dirname + '/../app/views', {
    map:{
       html: 'swig'
    }
}));

// 配置mongodb
config.databse.connect && app.use(mongo(app,{
    root: config.appPath + '/model/',
    connect: config.databse.connect
}));

//Routes
routes(router);
app.use(router.routes());


module.exports = app;
