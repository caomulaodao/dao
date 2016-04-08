/**
 * Created by laodao on 16/3/29.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const debug = require('debug')('koa-grace:mongo');

/**
 * 查找目录中的所有文件
 * @param  {string} dir       查找路径
 * @param  {init}   _pending  递归参数，忽略
 * @param  {array}  _result   递归参数，忽略
 * @return {array}            文件list
 */
function _ls(dir, _pending, _result) {
    console.log("---ls");
    _pending = _pending ? _pending++ : 1;
    _result = _result || [];

    if (!path.isAbsolute(dir)) {
        dir = path.join(process.cwd(), dir);
    }

    // if error, throw it
    let stat = fs.lstatSync(dir);

    if (stat.isDirectory()) {
        let files = fs.readdirSync(dir);
        files.forEach(function(part) {
            _ls(path.join(dir, part), _pending, _result);
        });
        if (--_pending === 0) {
            return _result;
        }
    } else {
        _result.push(dir);
        if (--_pending === 0) {
            return _result;
        }
    }
};

/**
 * 生成mongoose操作方法
 * @param  {string} app     context
 * @param  {object} options 配置项
 *         {string} options.root mongo的model配置路径
 *         {string} options.connect mongo连接路径
 * @return {function}
 */
function mongo(app, options) {

    const root = options.root;
    const connect = options.connect;

    // 创建数据库连接
    let db = mongoose.createConnection(connect);

    db.on('error', function(err){
        debug(`error: connect ${connect} ${err}`);
    });
    db.once('open', function() {
        debug(`connect ${connect} success!`);
    });

    let Schema = {},Model = {};
    _ls(root).forEach(function(filePath) {
        if (!/.js$/.test(filePath)) {
            return;
        }

        let mod = require(filePath);

        // 创建schema
        let _schema = new mongoose.Schema(mod.schema[0],mod.schema[1]);
        _schema.methods = mod.methods;

        // 发布为Model
        let _model = db.model(mod.model, _schema);

        Schema[mod.model] = _schema;
        Model[mod.model]  = _model;
    });

    return function* ctrl(next) {
        if (this.mongo) return yield next

        Object.assign(this, {
            /**
             * mongo
             * @return {Object} 返回一个Entity对象
             */
            mongo: function (mod, data){
                return (new Model[mod](data));
            },
            /**
             * mongoMap
             * @param {Array} list mongo请求列表
             *        {Object}    list[].model 模型
             *        {Array}     list[].arg 参数
             *        {Function}  list[].fun 模型方法
             */
            mongoMap: function* (list){
                /**
                 * _Mongo
                 * @param {Object} opt 配置项
                 *        {Object}  opt.model 模型
                 *        {Array}  opt.arg 参数
                 *        {Function}  opt.fun 模型方法
                 */
                function* _Mongo(opt){
                    let arg = opt.arg || [];
                    let model = opt.model;
                    let fun = opt.fun;
                    let res = yield fun.apply(model, arg);

                    return res;
                }

                let result = yield list.map(_Mongo);

                return result;
            }
        })

        yield next;
    };
};

module.exports = mongo