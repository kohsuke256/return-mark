let outer;
let questionNumberElement;
let sent; // sentence
let startTime;
let questionNumber;
let score;
let selectedChar;

const params = function (paramText){
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const params = {};
  let match;
  while(match = regex.exec(paramText)){
    params[match[1]] = match[2];
  }
  return params;
}(location.href);

let level = parseInt(params['level']);
let idiom = parseBool(params['idiom']);
let ligature = parseBool(params['ligature']);
let questionCount = parseInt(params['count'])

let count;
let sentHistory;
let correctCount;


function randInt(start, end) { // start から (end - 1) までのランダムな整数を返す
	return Math.floor(Math.random() * (end - start) + start);
}

function randFloat(start, end) { // start から (end - 1) までのランダムな実数を返す
	return Math.random() * (end - start) + start;
}

function randBool(probability=0.5) { // probability の確率で true そうでなければ false を返す
	return Math.random() < probability;
}

function parseBool(arg) {
	const dict = {
		"false": false,
		"true": true,
		"0": false,
		"1": true,
		0: false,
		1: true,
	}
	return dict[arg];
}

function update() {
	if (sent.isFirst()) {
		outer.classList.remove('not-first');
	} else {
		outer.classList.add('not-first');
	}
	outer.innerHTML = sent.toHTML();
	selectChar(selectedChar); // クラスの付け直し
}

function question() {
	count = 0;
	sent = Sentence.makeSentence(level, idiom, ligature, volume=level * 10 + 10);
	questionNumberElement.innerHTML = `${japaneseNumber(questionNumber)}問目`;
	selectChar(-1);
	update();
}

function longQuestion() { // デバッグ用
	count = 0;
	let marks = [];
	for (let i = 0; i < 500; i++) {
		marks.push(randInt(0, 2));
	}
	sent = new Sentence(marks);
	// questionNumberElement.innerHTML = `${japaneseNumber(questionNumber)}問目`;
	selectChar(-1);
	update();
}

function reset() {
	document.getElementById('ui').style.display = '';
	questionNumber = 1;
	questionNumberElement = document.getElementById('question-number');
	score = 0;
	correctCount = 0;
	outer = document.getElementById('outer');
	sentHistory = [];
	startTime = performance.now();
	question();
}

function clickChar(index) {
	if (sent.isClicked(index)) {
		if (index == selectedChar) {
			playSE('select');
			selectChar(-1);
		} else {
			playSE('select');
			selectChar(index)
		}
	} else {
		if (selectedChar == -1) {
			playSE('click');
			count++;
			sent.clicked(index, count);
		} else {
			playSE('click');
			count++;
			sent.insert(index, sent.getCount(selectedChar));
		}
		update();
	}
}

function selectChar (index) { // -1:選択解除
	selectedChar = index;
	for (let c of document.getElementsByClassName('selected')) {
		c.classList.remove('selected');
	}
	let chars = document.getElementsByClassName('char');
	if (0 <= index && index < chars.length) {
		chars[index].classList.add('selected');
		document.getElementById('del').classList.add('selected');
	} else {
		document.getElementById('del').classList.remove('selected');
	}
}

function next() {
	sentHistory.push(sent);
	if (sent.isCorrect()) {
		score += sent.getScore();
		correctCount++;
		playSE('correctAnswer');
	} else {
		score -= Math.ceil((level * 2 + 1) * 5 / sent.getScore());
		playSE('incorrectAnswer');
	}
	if (questionNumber >= questionCount) {
		showResult();
	} else {
		questionNumber++;
		question();
	}
}

function del() {
	playSE('del');
	sent.del(selectedChar);
	if (selectedChar == -1) {
		count = 0;
		score -= 5;
	} else {
		count--;
		score--;
	}
	selectChar(-1);
	update();
}

function undo() {
	if (count > 0) {
		playSE('undo');
		sent.undo(count);
		count--;
		score--;
		selectChar(-1);
		update();
	}
}

function showResult() {
	document.getElementById('ui').style.display = 'none';
	let second = Math.floor((performance.now() - startTime) / 1000);
	let result = document.getElementById('result');
	let correctRate = correctCount / questionCount;
	outer.innerHTML = `<div class="result-content">${result.innerHTML}</div>`;
	document.getElementById('level').innerHTML = ["いと易し", "易し", "並", "難し", "いと難し"][level];
	document.getElementById('count').innerHTML = `${japaneseNumber(questionCount)}問`;
	document.getElementById('correct').innerHTML = `${japaneseNumber(correctCount)}問`;
	document.getElementById('rate').innerHTML = `${japaneseNumber(Math.floor(correctRate * 10))}割${Math.floor(correctRate * 100 % 10) == 0 ? '' : `${japaneseNumber(Math.floor(correctRate * 100 % 10))}分`}`;
	document.getElementById('time').innerHTML = second < 60 ? `${japaneseNumber(second)}秒` : `${japaneseNumber(Math.floor(second / 60))}分${japaneseNumber(second % 60)}秒`;
	let result_score = Math.floor(score * 10 / second + questionCount * level * 2);
	document.getElementById('score').innerHTML = `${japaneseNumber(result_score)}点`;
	document.getElementById('errata').innerHTML = sentHistory.map((s, i) => `<details class="${s.isCorrect() ? 'correct' : 'incorrect'}"><summary>${japaneseNumber(i + 1)}問目</summary><div class="errata-sent">${s.getErrata()}</div></details>`).join('');
	outer.classList.remove('not-first');
}
