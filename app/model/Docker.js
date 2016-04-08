/**
 * Created by laodao on 16/3/29.
 */

// model名称，即表名
var model = 'Docker';

// 表结构
exports.schema = [{
    name: {type: String,unique:true},
    introduce: {type: String},
    type:{type: String},
    configs:{
        port:{type: String},
        password:{type: String}
    }
},{
    autoIndex: true,
    versionKey: false
}];

//静态方法:http://mongoosejs.com/docs/guide.html#statics
exports.statics = {};

//http://mongoosejs.com/docs/guide.html#methods
exports.methods = {
    list: function* (type) {
        return this.model('Docker').find({type:type});
    },
    deleteById: function* (id){
        return this.model('Docker').findByIdAndRemove(id).exec();
    },
    findById: function* (id){
        return this.model('Docker').findById(id).exec();
    }
};

exports.model = model;
