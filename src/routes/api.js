'use strict';

const express = require('express');

const uploadsController = require('../controllers/uploads');
const helpers = require('./helpers');

module.exports = function (app, middleware, controllers) {
	const middlewares = [middleware.autoLocale, middleware.authenticateRequest];
	const router = express.Router();
	app.use('/api', router);

	const routerV3 = express.Router();
    app.use('/api/v3', routerV3);

	router.get('/config', [...middlewares, middleware.applyCSRF], helpers.tryRoute(controllers.api.getConfig));

	router.get('/self', [...middlewares], helpers.tryRoute(controllers.user.getCurrentUser));
	router.get('/user/uid/:uid', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByUID));
	router.get('/user/username/:username', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByUsername));
	router.get('/user/email/:email', [...middlewares, middleware.canViewUsers], helpers.tryRoute(controllers.user.getUserByEmail));

	router.get('/categories/:cid/moderators', [...middlewares], helpers.tryRoute(controllers.api.getModerators));
	router.get('/recent/posts/:term?', [...middlewares], helpers.tryRoute(controllers.posts.getRecentPosts));
	router.get('/unread/total', [...middlewares, middleware.ensureLoggedIn], helpers.tryRoute(controllers.unread.unreadTotal));
	router.get('/topic/teaser/:topic_id', [...middlewares], helpers.tryRoute(controllers.topics.teaser));
	router.get('/topic/pagination/:topic_id', [...middlewares], helpers.tryRoute(controllers.topics.pagination));

	const multipart = require('connect-multiparty');
	const multipartMiddleware = multipart();
	const postMiddlewares = [
		middleware.maintenanceMode,
		multipartMiddleware,
		middleware.validateFiles,
		middleware.uploads.ratelimit,
		middleware.applyCSRF,
	];

	router.post('/post/upload', postMiddlewares, helpers.tryRoute(uploadsController.uploadPost));
	router.post('/user/:userslug/uploadpicture', [
		...middlewares,
		...postMiddlewares,
		middleware.exposeUid,
		middleware.ensureLoggedIn,
		middleware.canViewUsers,
		middleware.checkAccountPermissions,
	], helpers.tryRoute(controllers.accounts.edit.uploadPicture));

	routerV3.put('/topics/:tid/resolved', [...middlewares], async (req, res) => {
        const tid = req.params.tid;
        try {
            await topicsAPI.markResolved(req.user.uid, { tid });
            console.log('Topic marked as resolved');
            res.status(200).send({ success: true });
        } catch (err) {
            console.error('Error marking topic as resolved:', err);
            res.status(500).send({ error: err.message });
        }
    });

    routerV3.delete('/topics/:tid/resolved', [...middlewares], async (req, res) => {
        const tid = req.params.tid;
        try {
            await topicsAPI.markUnresolved(req.user.uid, { tid });
            console.log('Topic marked as unresolved');
            res.status(200).send({ success: true });
        } catch (err) {
            console.error('Error marking topic as unresolved:', err);
            res.status(500).send({ error: err.message });
        }
    });
};
