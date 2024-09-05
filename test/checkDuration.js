'use strict';


console.log('Lucia Fang, yufang')
const assert = require('assert');

const path = require('path');
const util = require('util');


const validator = require('validator');
const { JSDOM } = require('jsdom');
const slugify = require('../src/slugify');

const dom = new JSDOM('<html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.jQuery = require('jquery');
global.$ = global.jQuery;
const { $ } = global;

global.define = (name, deps, callback) => {
    const mocks = {
        share: {},
        navigator: {},
        components: {},
        translator: {},
        votes: {},
        api: {},
        bootbox: {},
        alerts: {},
        hooks: {},
        helpers: {
            humanReadableNumber: (num) => num
        }
    };

    const moduleExports = callback(
        mocks.share,
        mocks.navigator,
        mocks.components,
        mocks.translator,
        mocks.votes,
        mocks.api,
        mocks.bootbox,
        mocks.alerts,
        mocks.hooks,
        mocks.helpers
    );

    global.postToolsModule = moduleExports;
};

//`ajaxify`
global.ajaxify = {
    data: {
        titleRaw: 'Mock Title',
        postcount: 123,
        postEditDuration: '3600', // 1 hour in seconds
        postDeleteDuration: '86400', // 1 day in seconds
    },
    privileges: {
        isAdminOrMod: false
    }
};


require(path.resolve(__dirname, '../public/src/client/topic/postTools.js'));

delete global.define;

const PostTools = global.postToolsModule;

const sleep = util.promisify(setTimeout);

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const posts = require('../src/posts');
const categories = require('../src/categories');
const privileges = require('../src/privileges');
const user = require('../src/user');
const groups = require('../src/groups');
const socketPosts = require('../src/socket.io/posts');
const apiPosts = require('../src/api/posts');
const apiTopics = require('../src/api/topics');
const meta = require('../src/meta');
const file = require('../src/file');
const helpers = require('./helpers');
const utils = require('../src/utils');
const request = require('../src/request');




describe('PostTools.checkDuration', () => {
    let originalDateNow;
    let alerts;

    if (!ajaxify.data.privileges) {
        ajaxify.data.privileges = {};
    }
    
    ajaxify.data.privileges.isAdminOrMod = true;


    it('should return true if post timestamp is within the duration', () => {
        const duration = 10; // 10 seconds
        const currentTime = 10000; 
        const postTimestamp = 9000; // 1 second ago
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should return false if post timestamp exceeds the duration', () => {
        const duration = 10; // 10 seconds
        const currentTime = 20000; 
        const postTimestamp = 5000; //  15 seconds ago
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should display days and hours if duration exceeds one day', () => {
        const duration = 90000; 
        const currentTime = 200000; 
        const postTimestamp = 100000;
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should display only days if there are no hours', () => {
        const duration = 86400; 
        const currentTime = 200000;
        const postTimestamp = 113600;
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should display hours and minutes if duration is within hours', () => {
        const duration = 7200 + 1200; 
        const currentTime = 300000;
        const postTimestamp = 291600;
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should display only hours if no minutes', () => {
        const duration = 3600; 
        const currentTime = 400000;
        const postTimestamp = 396400;
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should display minutes and seconds if duration is within minutes', () => {
        const duration = 120 + 30; 
        const currentTime = 500000;
        const postTimestamp = 499850;
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should display only minutes if no seconds', () => {
        const duration = 120; 
        const currentTime = 600000;
        const postTimestamp = 599880;
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should return true if no post timestamp is provided', () => {
        const currentTime = 300000; 
        const result = PostTools.checkDuration(100, null, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });

    it('should return false and display correct error if timestamp is exactly at the limit', () => {
        const duration = 60; 
        const currentTime = 300000;
        const postTimestamp = 299940; 
        const result = PostTools.checkDuration(duration, postTimestamp, 'timeout', currentTime);
        assert.strictEqual(result, true);
    });
});
console.log('Lucia Fang, yufang')
