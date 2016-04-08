/**
 * Created by laodao on 16/3/29.
 */

"use strict";
var index = require('../controllers/index');

function routes(router) {
    router.get('/', index.index);
    router.get('/new/', index.new);
    router.get('/list/', index.list);
    router.get('/info/', index.info);
    router.post('/new/add/', index.add);
    router.get('/delete/', index.delete);
    router.get('/content/', index.content);
    router.get('/dockerstart/', index.dockerstart);
    router.get('/dockerstop/', index.dockerstop);
}

module.exports = routes;