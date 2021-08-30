const currentURL = location.href;

function emphasize() {
	let emphasizes = document.getElementsByTagName('iframe');
	for (let emphasized of emphasizes) {
		for (let node of emphasized.contentWindow.document.getElementsByClassName('emphasize')) {
			node.classList.remove('emphasize');
		}
	}
	if (location.href.indexOf('#') != -1) {
		let frame = document.getElementById(location.href.slice(location.href.indexOf('#') + 1, location.href.indexOf('?')));
		let id = location.href.slice(location.href.indexOf('?id=') + 4);
		let element = frame.contentWindow.document.getElementById(id);
		frame.classList.add('emphasize-frame')
		element.classList.add('emphasize')
	}
}

function jump2id(frame, id) {
	window.location.href = `${window.parent.location.href.indexOf('#') == -1 ? window.parent.location.href : window.parent.location.href.slice(0, window.parent.location.href.indexOf('#'))}#${frame}?id=${id}`
	emphasize();
}
