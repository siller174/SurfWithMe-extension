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
	chrome.storage.local.get(('mode'), function (res) {
		if (res.mode !== MODE_HOST) {
			return // skip
		}
		chrome.storage.local.get(('id'), function (res) {
			const body = JSON.stringify({
				"id": res.id,
				"url": userLink,
			})
			chrome.storage.local.get(("host_last_send_link"), function (res) {
				if (res.host_last_send_link === userLink) {
					// link was not change, skip
					return
				}
				fetch(`${HOST}/api/v1/meeting`, {
					method: 'PUT',
					body,
				}).then((res) => {
					if (res.status === 204) {
						chrome.storage.local.set({ "host_last_send_link": userLink })
					}
					if (res.status !== 204) {
						chrome.storage.local.remove("host_last_send_link")
						chrome.storage.local.set({ mode: MODE_OFF }) //todo or remove mode?
					}
				})

			})
		})
	})
});

chrome.storage.local.get(({ mode, url, id }) => {
	alert("mod " + mode + " url " + url + " id " + id)
	if (id) {
		if (mode === MODE_CLIENT) {
			const body = JSON.stringify({
				id,
			})
			fetch(`${HOST}/api/v1/meeting`, {
				method: 'POST',
				body,
			})
				.then((res) => {
					if (res.status === 404) {
						chrome.storage.local.set({ mode: MODE_OFF })
						return
					}
					if (res.status == 200) {
						chrome.storage.local.get(("client_last_get_link"), function (res) {
							if (res.client_last_get_link === res.json.url) {
								// link was not change, skip
								return
							}
						})
						chrome.storage.local.set({ "client_last_get_link": url })
						setTimeout(() => {
							location.assign(url)
						}, 5000)
					}
				})
		}
	}
})
