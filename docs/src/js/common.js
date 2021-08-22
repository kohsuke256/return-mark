const SEs = loadSE();

let yetLoad = true;
let isMobile;

const STYLE_SHEETS = ['common', 'index', 'practice', 'mark', 'reading', 'iframe', 'error'];
const TOC_CLASS = {
	'H1': 'toc-1',
	'H2': 'toc-2',
	'H3': 'toc-3',
	'H4': 'toc-4'
};
const JAPANESE_NUMBER = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const JAPANESE_DIGIT = ["", "十", "百", "千"];
const JAPANESE_NUMERAL = ["", "万", "億", "兆", "京", "垓", "𥝱", "穣", "溝", "澗", "正", "載", "極", "恒河沙", "阿僧祇", "那由他", "不可思議", "無量大数"]


function japaneseNumber(num) {
	if (num < 0) {
		return `負の${japaneseNumber(-num)}`;
	} else if (num == 0) {
		return JAPANESE_NUMBER[0];
	} else if (num < 10 ** JAPANESE_DIGIT.length) {
		let eachDigit = [];
		for (let i = Math.floor(Math.log10(num)); i >= 0; i--) {
			let f = Math.floor((num % (10 ** (i + 1))) / (10 ** i));
			if (f != 0) {
				eachDigit.push((i != 0 && f == 1 ? '' : JAPANESE_NUMBER[f]) + JAPANESE_DIGIT[i]);
			}
		}
		return eachDigit.join('');
	} else if (num < (10 ** JAPANESE_DIGIT.length) ** JAPANESE_NUMERAL.length) {
		let eachDigit = [];
		for (let i = Math.floor(Math.log10(num) / JAPANESE_DIGIT.length); i >= 0; i--) {
			let f = Math.floor((num % (10 ** ((i + 1) * JAPANESE_DIGIT.length))) / (10 ** (i * JAPANESE_DIGIT.length)));
			if (f != 0) {
				eachDigit.push(`${japaneseNumber(f)}${JAPANESE_NUMERAL[i]}`);
			}
		}
		return eachDigit.join('');
	} else if (isNaN(num)) {
		return "非数";
	} else if (!isFinite(num)) {
		return "無限大";
	} else {
		return "オーバーフロー";
	}
}

function loadSE() {
	return {
		'click': new Audio("se/click.wav"),
		'select': new Audio("se/select.wav"),
		'del': new Audio("se/del.wav"),
		'undo': new Audio("se/undo.wav"),
		'correctAnswer': new Audio("se/correctAnswer.wav"),
		'incorrectAnswer': new Audio("se/incorrectAnswer.wav")
	};
}

function playSE(name) {
	let se = SEs[name];
	se.pause();
	se.currentTime = 0;
	se.play();
}

function startUp() {
	if(navigator.userAgent.indexOf("Windows") >= 0 || navigator.userAgent.indexOf("Macintosh") >= 0) {
		for (let sheet of STYLE_SHEETS) {
			let element = document.getElementById(`${sheet}-style`);
			if (element) {
				element.setAttribute("href", `./src/css/${sheet}.css`);
			}
		}
	} else {
		for (let sheet of STYLE_SHEETS) {
			let element = document.getElementById(`${sheet}-style`);
			if (element) {
				element.setAttribute("href", `./src/css/m-${sheet}.css`);
			}
		}
	}
}

window.onmousewheel = function(event) {
	if (!event.ctrlKey && !event.shiftKey) {
		let html = document.getElementsByTagName('html')[0];
		html.scrollLeft += event.wheelDelta;
	}
}

function loadHeader() {
	if (yetLoad) {
		yetLoad = false;
		let xhr = new XMLHttpRequest();
		xhr.open('GET', "./header.html", true);
		xhr.onreadystatechange = function () {
			if(xhr.readyState === 4 && xhr.status === 200) {
				let responseText = xhr.responseText;
				console.log(responseText);
				for (let header of document.getElementsByClassName('auto-load-header')) {
					header.innerHTML = xhr.responseText;
					console.log(header);
				}
			}
		};
		xhr.send();
	}
}

function makeToc() {
	let headings = document.getElementsByClassName('heading');
	let htmls = [];
	for (let heading of headings) {
		htmls.push(`<a href="${location.href.slice(0, location.href.indexOf('#') == -1 ? undefined : location.href.indexOf('#'))}#${heading.id}" class="${TOC_CLASS[heading.tagName]}">${heading.innerHTML}</a>`);
	}
	document.getElementById('toc').innerHTML = htmls.join('');
}
