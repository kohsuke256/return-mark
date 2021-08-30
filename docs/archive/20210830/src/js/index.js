const LEVEL_NAME = ['very-easy', 'easy', 'normal', 'hard', 'very-hard', 'ogre'];
const DEFAULT_CONFIG = [0b00, 0b00, 0b10, 0b11, 0b11]
const SECRET_COMMAND = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let questionCount = 5;
let secretCommandStep = 0;


function formatQuety(level, idiom, ligature) {
	return `?level=${level}&idiom=${idiom}&ligature=${ligature}&count=${questionCount}`
}

function getLevel() {
	let level = 2;
	let levelRedio = document.getElementsByName('level');
	for (let i = 0; i < levelRedio.length; i++) {
		if (levelRedio.item(i).checked) {
			level = LEVEL_NAME.indexOf(levelRedio.item(i).value);
    }
  }
	return level;
}

function startPractice() {
	let level = getLevel();
	let idiom = document.getElementById('idiom').checked;
	let ligature = document.getElementById('ligature').checked;
	window.location.href = `./practice/index.html${formatQuety(level, idiom, ligature)}`;
}

function redioChanged() {
	let details = document.getElementById('details');
	if (!details.open) {
		let level = getLevel();
		document.getElementById('ligature').checked = DEFAULT_CONFIG[level] >= 2; // 0b1X
		document.getElementById('idiom').checked = DEFAULT_CONFIG[level] % 2 == 1; // 0bX1
	}
}

function configCount(volume=0) {
	questionCount += volume;
	if (questionCount <= 0) {
		questionCount = 1;
	} else if (questionCount > 1000) {
		questionCount = 1000;
	}
	document.getElementById('count-main').innerHTML = `${japaneseNumber(questionCount)}問`;
}

function showOgre() {
	document.getElementById('ogre-li').style.display = 'initial';
}

function setEvent() {
	document.body.addEventListener('keydown', function (event) {
		if (event.code == SECRET_COMMAND[secretCommandStep]) {
			secretCommandStep++;
			if (secretCommandStep == SECRET_COMMAND.length) {
				showOgre();
				secretCommandStep = 0;
			}
		} else {
			secretCommandStep = 0;
		}
	})
}
