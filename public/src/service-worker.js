'use strict';

self.addEventListener('fetch', function (event) {
	// This is the code that ignores post requests
	// https://github.com/NodeBB/NodeBB/issues/9151
	// https://github.com/w3c/ServiceWorker/issues/1141
	// https://stackoverflow.com/questions/54448367/ajax-xmlhttprequest-progress-monitoring-doesnt-work-with-service-workers
	if (event.request.method === 'POST') {
		return;
	}

	event.respondWith(caches.match(event.request).then(function (response) {
		if (!response) {
			return fetch(event.request);
		}

		return response;
	}));
});

// // Disable fetch event handling temporarily
// self.addEventListener('fetch', function (event) {
//     console.log('Service worker fetch event disabled for testing:', event.request.url);
//     // Do nothing in this event listener to bypass all fetch handling
//     return;
// });
