// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')
cloud.init()

'use strict';

const Client = require('aliyun-api-gateway').Client;
const client = new Client('25912635', '48662cbccd80e9022cc6b0110948a461');
// 云函数入口函数
exports.main = async (event, context) => {
  async function post() {
    var url = 'http://aidisease.market.alicloudapi.com/ai_disease_search/elite?DISEASE=%E7%B3%96%E5%B0%BF%E7%97%85';
    var result = await client.post(url, {
      data: {
        'testtest': 'query1Value'
      },
      headers: {
        accept: 'application/json'
      }
    });

    console.log(JSON.stringify(result));
  }

  post().catch((err) => {
    console.log(err.stack);
  });
}