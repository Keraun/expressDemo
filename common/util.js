'use strict';

const _      = require('lodash');
const moment = require('moment');
const momentZ = require('moment-timezone');
const md5    = require('blueimp-md5');
const uid    = require('node-uuid');
const Path   = require('path');
const colors = require('colors/safe');
const fs     = require('fs');
const CryptoJS = require('crypto-js');

const util = _.runInContext();
util.mixin({
    uid: uid,
    filterUserId: (data) => {
        if(util.isPlainObject(data)) {
            return util.omit(data, 'userId');
        }
        if(!util.isObject(data)) return data;
        let newData = [];
        data.map(d => {
            newData.push(util.omit(d, 'userId'));
        });
        return newData;
    },
    getParamObj: (req, keys, type) => {
        let types = {
            'get': 'query',
            'post': 'body'
        };
        let params = {};
        keys.map(key => {
            if(req[types[type]][key]) {
                params[key] = req[types[type]][key]
            }
        });
        return params;
    },
    getParams: (req, cols, type) => {
        let types = {
            'get': 'query',
            'post': 'body'
        };
        let paramType = types[type];
        let params = {};
        let reqParam = req[paramType];
        cols.map(k => {
            if(reqParam[k]) {
                params[k] = reqParam[k];
            }
        });
        return params;
    },
    validateParams: (req, cols, type) => {
        let types = {
            'get': 'query',
            'post': 'body'
        };
        let paramType = types[type];
        let params = {};
        let error = [];
        let reqParam = req[paramType];
        Object.keys(cols).map(k => {

            if(reqParam[k]) {
                params[k] = reqParam[k];
            } else {
                if(cols[k]) {
                    error.push('缺少' + k);
                }
            }
        });
        if(error.length) {
            return {
                params: params,
                error: error.join(';')
            }
        }
        return {
            params,
        };
    },
    catchJsonParse: (data, defaultValue) => {
        let result;
        try {
            result = JSON.parse(data);
        } catch(e) {
            result = defaultValue || null;
        }
        return result;
    },
    consoleLog: (data, type) => {
        type = type || 'info'
        if(type === 'info') {
            console.log(colors.green(data));
        } else if(type === 'error') {
            console.log(colors.red(data));
        } else if(type === 'warn') {
            console.log(colors.yellow(data));
        }
    },
    randomRange: (min, max) => {
        return parseInt(Math.random()*(max-min+1)+min)
    },
    aesEncode: (key, obj) => {
        var k = CryptoJS.enc.Utf8.parse(key);
        var iv = CryptoJS.enc.Utf8.parse(key);

        var encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), k, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    },
    aesDecode: (encodeKey, str) => {
        let key = CryptoJS.enc.Utf8.parse(encodeKey);
        var decrypted = CryptoJS.AES.decrypt(
            str,
            key,
            {
                iv: key,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        let data;
        try{
            data = decrypted.toString(CryptoJS.enc.Utf8);
        } catch(e) {
            return {};
        }
        return util.catchJsonParse(data, {});
    },
    encode: (v, key) => {
        if(typeof v === 'object') {
            v = JSON.stringify(v);
        }
        let enc = CryptoJS.AES.encrypt(v, key);
        return enc.toString();
    },
    decode: (enc, key, type) => {
        let dec =CryptoJS.AES.decrypt(enc.toString(), key);
        if(type === 'object') {
            return JSON.parse(dec.toString(CryptoJS.enc.Utf8));
        }
        return dec.toString(CryptoJS.enc.Utf8);
    },
    //将对象或者数组中的下划线转成驼峰
    snakeCaseField: (obj) => {
        //TODO 优化
        let underscoredData = {};
        if(util.isPlainObject(obj)) {
            let sn = (obj, underscoredData) => {
                Object.keys(obj).map(k => {
                    if(!k) return;
                    let tmp = k;
                    if(k.indexOf('$') === -1) {
                        tmp = util.snakeCase(tmp);
                    }
                    let v = obj[k];
                    if(util.isPlainObject(v)) {
                        underscoredData[tmp] = {};
                        return sn(v, underscoredData[tmp]);
                    } else {
                        underscoredData[tmp] = obj[k];
                    }
                });
                return underscoredData;
            }
            return sn(obj, underscoredData);
        }
        //数组
        if(typeof obj === 'object') {
            let tmp = [];
            util.forEach(obj, k => {
                tmp.push(util.snakeCase(k));
            });
            return tmp;
        }
    },
    camelCaseField: (obj) => {//变更驼峰命名
        let underscoredData = {};
        let sn = (obj, underscoredData) => {
            Object.keys(obj).map(k => {
                let tmp = util.camelCase(k);
                let v = obj[k];
                if(util.isPlainObject(v)) {
                    underscoredData[tmp] = {};
                    return sn(v, underscoredData[tmp]);
                } else {
                    underscoredData[tmp] = obj[k];
                }
            });
            return underscoredData;
        }
        return sn(obj, underscoredData);
    },
    camelCaseArray: (arr) => {
        return util.forEach(arr, (v) => {
            return util.camelCaseField(v);
        });
    },
    transFailData: (data) => {
        if(typeof data === 'string') {
            console.error(data);
            return {
                result: 500,
                message: data
            }
        }
        if(util.isPlainObject(data) || util.isError(data)) {
            console.error(data);
            if(data.message) {
                return util.assign({}, data, {
                    result: data.result || 500,
                    message: data.message
                });
            }
            else return {
                result: data.result || 500,
                message: data
            };
        }
    },
    transSucData: (data) => {
        let tmp;
        if(typeof data === 'string' || !data) {
            tmp = {
                result: 100,
                data: data  || 'success'
            }
        } else if(util.isPlainObject(data)) {
            if(data.hasOwnProperty('data')) {
                tmp = {
                    result: data.result || 100,
                    data: data.data
                };
            } else tmp = {
                result: data.result || 100,
                data: data
            };
        } else tmp = {
            result: 100,
            data: data
        };
        return tmp;
    },
    getQueryParams: (params) => {
        let arr = [];
        util.forEach(params, (value, key) => {
            arr.push(key + '=' + value);
        });

        let str = arr.join('&');
        return str;
    },
    md5: (str, suffix) => {
        if(suffix) return md5(str + suffix);
        return md5(str);
    },
    startDate: (date) => {
        return moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    },
    endMonth: () => {
        return moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
    },
    endDate: (date) => {
        return moment(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');
    },
    formatDateQuery: (startDate, endDate) => {
        //TODO 时间跨度限制
        let today = util.todayStartAndEnd();
        if(startDate) startDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
        else startDate = today.startDate;

        if(endDate) {
            let tmp = new Date(moment(endDate).format('YYYY-MM-DD HH:mm:ss'));
            if(!tmp.getHours() && !tmp.getMinutes()) {
                endDate = util.endDate(endDate);
            } else endDate = moment(endDate).format('YYYY-MM-DD HH:mm:ss');
        } else endDate = today.endDate;
        return {
            startDate, endDate,
        };
    },
    todayStartAndEnd: () => {
        return {
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
        };
    },
    nowTimestamp: () => {
        return Date.parse(new Date());
    },
    now: () => {
        return momentZ().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
    },
    formatDate: (createdAt) => {
        return moment(createdAt).utc().format("YYYY-MM-DD");
    },
    formatFullTimeZone: (createdAt) => {
        return momentZ(createdAt).tz('Asia/Shanghai').format("YYYY-MM-DD HH:mm:ss");
    },
    formatFullTime: (createdAt) => {
        return moment(createdAt).utc().format("YYYY-MM-DD HH:mm:ss");
    },
    formatSampleTime: (createdAt) => {
        return moment(createdAt).utc().format("YYYYMMDD");
    },
    writeFile: (buffer, callback) => {
        let fileName = util.uid();
        let filePath = Path.resolve(__dirname, '../../log/' + fileName + '.png');
        fs.writeFile(filePath, buffer, (err) => {
            callback(err, filePath);
        });
    },
    isMobile: (mobile) => {
        let mobileReg = /^1[34578]\d{9}$/;
        return mobileReg.test(mobile)
    },
    isWechat: (ua) => {
        ua = ua.toLowerCase();
        return ua.match(/MicroMessenger/i) == "micromessenger";
    },
    getAccessCode: () => {
        return util.randomRange(100000, 999999);
    },
    getCapcha: () => {
        return util.randomRange(1000, 9999) + '';
    },
    xmlObj2js: (xmlObj) => {
        let res = {};
        for (let key in xmlObj.xml) {
            res[key] = xmlObj.xml[key][0];
        }
        return res;
    },
    maskStr: (str, type) => {
        let  result = [];
        if(!str) return '';
        if(type === 'name') {
            str.split('').map((s, i) => {
                if(i === 0) result.push(s);
                else result.push('*');
            });
            return result.join('');
        }
        if(type === 'mobile') {
            str.split('').map((s, i) => {
                if(i <= 2 || i > 6) result.push(s);
                else result.push('*');
            });
            return result.join('');
        }
        if(type === 'address') {
            let pref = str.substr(0, str.indexOf('市') + 1);
            let suf = str.substr(-4);
            return pref + '****' + suf;
        }
    }
});

module.exports = util;
