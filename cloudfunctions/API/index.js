// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

'use strict';

const Client = require('aliyun-api-gateway').Client;
const client = new Client('25912635', '48662cbccd80e9022cc6b0110948a461');
// 云函数入口函数
exports.main = async (event, context) => { 

  var url = 'http://aidisease.market.alicloudapi.com/ai_disease_search/elite?DISEASE=' + 'data.DISEASE';
  var result = await client.get(url, {
    method: 'GET',
    data: {
      DISEASE : event.DISEASE
    },
    headers: {
      "Authorization": "APPCODE 230199b04a7944129bd1ab9f6e681eb3"
    },
  });
  return result;
   //console.log(JSON.stringify(result));

}