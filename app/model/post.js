'use strict';

// model名称，即表名
var model = 'Post';

// 表结构
exports.schema = [{
    title: {type: String,required: true}
},{
    autoIndex: true,
    versionKey: false
}];

// 静态方法:http://mongoosejs.com/docs/guide.html#statics
exports.statics = {};

// http://mongoosejs.com/docs/guide.html#methods
exports.methods = {
    list: function* (){
        return this.model(model).find();
    }
};

exports.model = model;
