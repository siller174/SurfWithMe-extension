const HOST = 'https://poom.live:9091'

const MODE_CLIENT = 'client'
const MODE_HOST = 'host'
const MODE_OFF = 'old_session'

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	var userLink = changeInfo.url
	if (userLink === undefined) {
		// skip
		return
	}
	chrome.storage.local.get(({ mode, id, host_last_send_link }) => {
		if (mode !== MODE_HOST) {
			return // skip
		}
		if (host_last_send_link === userLink) {
			// link was not change, skip
			return
		}
		const body = JSON.stringify({
			"id": id,
			"url": userLink,
		})
		fetch(`${HOST}/api/v1/meeting`, {
			method: 'PUT',
			body,
		}).then((res) => {
			if (res.status === 204) {
				chrome.storage.local.set({ host_last_send_link: userLink })
			}
			if (res.status !== 204) {
				chrome.storage.local.remove(['mode', 'id', 'host_last_send_link'])
			}
		})

	})
});

window.setInterval(function () {
	chrome.storage.local.get(({ mode, id, client_last_get_link }) => {
		if (mode !== MODE_CLIENT) {
			return // skip
		}
		const body = JSON.stringify({
			"id": id,
		})
		fetch(`${HOST}/api/v1/meeting`, {
			method: 'POST',
			body: body
		})
			.then((response) => {
				if (response.status === 404) {
					chrome.storage.local.remove(['mode', 'id', 'client_last_get_link'])
					return { url: '' }
				} else if (response.status == 200) {
					// send json response with URL
					return response.json()
				} else {
					return { url: '' }
				}
			})
			.then(({ url }) => {
				if (client_last_get_link !== url) {
					// link has changed
					chrome.storage.local.set({ client_last_get_link: url })
					// window.(url)
					// location.assign(url)
					chrome.tabs.update({ active: true, url: url });
				}
			})
	})
}, 1000 * 2);
