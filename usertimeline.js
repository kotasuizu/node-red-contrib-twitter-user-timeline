/**
 * Copyright (c) 2017 Kota Suizu
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 **/

module.exports = function(RED) {
  "use strict";
  var twitter = require('twitter');

  // Key情報を保持するConfig
  function TwitterUserTimelineConfig(n) {
    RED.nodes.createNode(this, n);
    this.consumer_key = n.consumer_key;
    this.consumer_secret = n.consumer_secret;
    this.access_token_key = n.access_token_key;
    this.access_token_secret = n.access_token_secret;
    var credentials = this.credentials;
    if ((credentials) && (credentials.hasOwnProperty("consumer_key"))) {
      this.consumer_key = credentials.consumer_key;
    }
    if ((credentials) && (credentials.hasOwnProperty("consumer_secret"))) {
      this.consumer_secret = credentials.consumer_secret;
    }
    if ((credentials) && (credentials.hasOwnProperty("access_token_key"))) {
      this.access_token_key = credentials.access_token_key;
    }
    if ((credentials) && (credentials.hasOwnProperty("access_token_secret"))) {
      this.access_token_secret = credentials.access_token_secret;
    }
  }
  RED.nodes.registerType("Twitter-User-Timeline-config", TwitterUserTimelineConfig, {
    credentials: {
      consumer_key: {
        type: "password"
      },
      consumer_secret: {
        type: "password"
      },
      access_token_key: {
        type: "password"
      },
      access_token_secret: {
        type: "password"
      }
    }
  });


  function TwitterUserTimeline(n) {
    RED.nodes.createNode(this, n);

    this.twitterConfig = RED.nodes.getNode(n.twitterconfig);

    this.screenname = n.screenname;
    this.count = n.count;
    this.includerts = n.includerts;
    this.trimuser = n.trimuser;
    this.excludereplies = n.excludereplies;
    this.contributordetails = n.contributordetails;

    var node = this;
    this.on('input', function(msg) {

      var client = new twitter({
        consumer_key: node.twitterConfig.consumer_key,
        consumer_secret: node.twitterConfig.consumer_secret,
        access_token_key: node.twitterConfig.access_token_key,
        access_token_secret: node.twitterConfig.access_token_secret
      });

      if (_isTypeOf('String', msg.payload.screenname)) {
        node.screenname = msg.payload.screenname;
      }
      if (_isTypeOf('Number', msg.payload.count)) {
        node.count = msg.payload.count;
      }
      if (_isTypeOf('Boolean', msg.payload.includerts)) {
        node.includerts = msg.payload.includerts;
      }
      if (_isTypeOf('Boolean', msg.payload.trimuser)) {
        node.trimuser = msg.payload.trimuser;
      }
      if (_isTypeOf('Boolean', msg.payload.excludereplies)) {
        node.excludereplies = msg.payload.excludereplies;
      }
      if (_isTypeOf('Boolean', msg.payload.contributordetails)) {
        node.contributordetails = msg.payload.contributordetails;
      }

      var params = {
        screen_name: node.screenname,
        count: node.count,
        include_rts: node.includerts,
        trim_user: node.trimuser,
        exclude_replies: node.excludereplies,
        contributor_details: node.contributordetails
      };

      client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
          msg.payload = {
            'statusCode' : response.statusCode,
            'tweets' : tweets
          };
          node.send(msg);
          node.log(RED._('Succeeded to API Call.'));
        } else if (response.statusCode === 401) {
          msg.payload = {
            'statusCode' : response.statusCode
          };
          node.send(msg);
          node.log(RED._('Error: 401 Authorization Required'));
        } else {
          node.error("Failed to API Call. " + error);
        }
      });
    });
  }
  RED.nodes.registerType("Twitter-User-Timeline", TwitterUserTimeline);

  function _isTypeOf(type, obj) {
      var clas = Object.prototype.toString.call(obj).slice(8, -1);
      return obj !== undefined && obj !== null && clas === type;
  }

}
