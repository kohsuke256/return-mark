const MARKS = [
	'', // 0
	'㆑', // 1
	'㆒', // 2
	'㆒㆑', // 3
	'㆓', // 4
	'㆔', // 5
	'㆕', // 6
	'㆖', // 7
	'㆖㆑', // 8
	'㆗', // 9
	'㆘', // 10
	'㆙', // 11
	'㆙㆑', // 12
	'㆚', // 13
	'㆛', // 14
	'㆜', // 15
	'㆝', // 16
	'㆝㆑', // 17
	'㆞', // 18
	'㆟', // 19
	'' // 20 (縦線)
];
const POINTS = [1, 2, 3, 4, 1, 3, 3, 5, 6, 1, 4, 6, 7, 1, 6, 6, 7, 8, 1, 7, 3]; // 加点
const WITH_RE = [1, 3, 8, 12, 17];
const GOTO = [2, 3, 7, 8, 11, 12, 16, 17];
const COMEFROM = [4, 5, 6, 9, 10, 13, 14, 15, 18, 19];


class Sentence {
	constructor(marks) {
		this.marks = marks;
		this.counts = [];
		for (let _ in this.marks) {
			this.counts.push(0);
		}
		this.length = this.marks.length;
		this.first = true;
		this.answer = Sentence.solve(this.marks);
	}
	getScore() {
		return this.marks.map((mark) => POINTS[mark] * 100).reduce((a, c) => a + c) + this.marks.length;
	}
	getErrata() {
		let chars = [];
		for (let i = 0; i < this.length; i++) {
			chars.push(this.char2HTML2(i));
		}
		return chars.join('');
	}
	getExample() {
		let chars = [];
		for (let i = 0; i < this.length; i++) {
			chars.push(this.char2HTML3(i));
		}
		return chars.join('');
	}
	isCorrect() {
		if (this.counts.includes(0)) {
			return false;
		} else {
			for (let i in this.counts) {
				if (this.counts[i] != this.answer[i]) {
					return false;
				}
			}
			return true;
		}
	}
	del(index) {
		if (index == -1) { // all
			this.counts = [];
			for (let _ in this.marks) {
				this.counts.push(0);
			}
		} else {
			this.counts = this.counts.map((c) => c >= this.counts[index] ? c - 1: c);
			this.counts[index] = 0;
		}
	}
	undo(count) {
		for (let i in this.counts) {
			if (this.counts[i] == count) {
				this.counts[i] = 0;
			}
		}
	}
	getCount(index) {
		return this.counts[index];
	}
	getAnswer() { // 正解を求める
		let r = [];
		for (i in this.marks) {
			r.push(i);
		}
		return r;
	}
	isClicked(idnex) { // もうクリックされているかどうか
		return this.counts[idnex] != 0;
	}
	clicked(index, count) {
		this.counts[index] = count;
	}
	insert(index, count) {
		this.counts = this.counts.map((c) => c >= count ? c + 1: c);
		this.counts[index] = count;
	}
	char2HTML(index) {
		let mark = this.marks[index];
		let count = this.counts[index];
		return `${this.marks[index + 1] == 20 ? '<div class="idiom">' : ''}<div class="char"><span class="border${count >= 100 ? 'big-num' : ''}" onClick="clickChar(${index})">${count == 0 ? '' : `<span>${count}</span>`}</span><span class="mark${mark == 20 ? ' idiom' : (MARKS[mark].length >= 2 ? ' crushed' : '')}">${MARKS[mark]}</span></div>${mark == 20 ? '</div>' : ''}`;
	}
	char2HTML2(index) { // 正誤表用
		let mark = this.marks[index];
		let count = this.counts[index];
		return `${this.marks[index + 1] == 20 ? '<div class="idiom">' : ''}<div class="char"><span class="border${count >= 100 ? 'big-num' : ''}">${count == 0 ? '' : `<span>${count}</span>`}${this.counts[index] != this.answer[index] ? `<span class="correction">${this.answer[index]}</span>` : ''}</span><span class="mark${mark == 20 ? ' idiom' : (MARKS[mark].length >= 2 ? ' crushed' : '')}">${MARKS[mark]}</span></div>${mark == 20 ? '</div>' : ''}`;
	}
	char2HTML3(index) { // お手本用
		let mark = this.marks[index];
		let count = this.answer[index];
		return `${this.marks[index + 1] == 20 ? '<div class="idiom">' : ''}<div class="char"><span class="border${count >= 100 ? 'big-num' : ''}" onClick="clickChar(${index})">${count == 0 ? '' : `<span>${count}</span>`}</span><span class="mark${mark == 20 ? ' idiom' : (MARKS[mark].length >= 2 ? ' crushed' : '')}">${MARKS[mark]}</span></div>${mark == 20 ? '</div>' : ''}`;
	}
	isFirst() {
		return this.first;
	}
	toHTML() {
		let chars = [];
		for (let i = 0; i < this.length; i++) {
			chars.push(this.char2HTML(i));
		}
		let html = chars.join('');
		this.first = false;
		return html;
	}
	static makeSentence(level, idiom, ligature, need=-1, volume=10) { // 問題を生成
		return new Sentence(Sentence.checkReWithInIdiom(Sentence.checkLastChar(Sentence.makePhrase(level, idiom, ligature, need, volume))));
	}
	static makePhrase(level, idiom, ligature, need, volume) { // 問題作成の肝 再起処理の部分
		if (volume < 0) {
			throw new Error('Unexpected Value Error');
		} else if (volume < 0) {
			return [];
		}
		let marks = [];
		switch (level) {
			case -1: // 返り点なし
			case 0: { // レ点のみ許可
				marks = Sentence.makeClause(level, idiom, ligature, volume)
				break;
			} case 1: { // 一二点まで
				let r = 8 / -(volume + 2) + 3;
				let span = Math.ceil(Math.random() * r); // 1 <= span
				let perOne = Math.ceil(volume / span); // 一つ当たりの volume
				let levels = [];
				for (let i = 0; i < span; i++) {
					levels.push(randInt(0, level + 1)); // 1 ~ span
				}
				if (need >= 1 && !levels.includes(level)) { // 必須なのに一つもなければ
					levels[randInt(0, levels.length)] = level; // 無理やり一つ変更する
				}
				for (let l of levels) {
					marks = marks.concat(Sentence.makeClause(l, idiom, ligature, perOne));
				}
				break;
			} case 2: { // 上下点まで
				let r = 6 / -(volume + 2) + 2.5;
				let span = Math.ceil(Math.random() * r); // 1 <= span
				let perOne = Math.ceil(volume / span); // 一つ当たりの volume
				let levels = [];
				for (let i = 0; i < span; i++) {
					levels.push(randInt(0, level + 1)); // 1 ~ span
				}
				if (need >= 2 && !levels.includes(level)) { // 必須なのに一つもなければ
					levels[randInt(0, levels.length)] = level; // 無理やり一つ変更する
				} else if (need == 1.5 && !levels.includes(2) && !levels.includes(1)) { // 甲乙の必要がない
					levels[randInt(0, levels.length)] = 1; // 無理やり一つ変更する
				}
				for (let l of levels) {
					marks = marks.concat(Sentence.makeClause(l, idiom, ligature, perOne));
				}
				break;
			} case 3: { // 甲乙点まで
				let r = 5 / -(volume + 2) + 2;
				let span = Math.ceil(Math.random() * r); // 1 <= span
				let perOne = Math.ceil(volume / span); // 一つ当たりの volume
				let levels = [];
				for (let i = 0; i < span; i++) {
					levels.push(randInt(0, level + 1)); // 1 ~ span
				}
				if (need >= 3 && !levels.includes(level)) { // 必須なのに一つもなければ
					levels[randInt(0, levels.length)] = level; // 無理やり一つ変更する
				}
				for (let l of levels) {
					marks = marks.concat(Sentence.makeClause(l, idiom, ligature, perOne));
				}
				break;
			} case 4: { // 天地人点
				let r = 4.5 / -(volume + 1.5) + 2;
				let span = Math.ceil(Math.random() * r); // 1 <= span
				let perOne = Math.ceil(volume / span); // 一つ当たりの volume
				let levels = [];
				for (let i = 0; i < span; i++) {
					levels.push(randInt(0, level + 1)); // 1 ~ span
				}
				if (need >= 4 && !levels.includes(level)) { // 必須なのに一つもなければ
					levels[randInt(0, levels.length)] = level; // 無理やり一つ変更する
				}
				for (let l of levels) {
					marks = marks.concat(Sentence.makeClause(l, idiom, ligature, perOne));
				}
				break;
			} case 5: { // 鬼 (天地人点レベルを複数連結)
				let x = randFloat(-2.5, 2.5);
				let r = Math.floor((x ** 3 + x + 25) / 5);
				for (let i = 0; i < r; i++) {
					marks = marks.concat(Sentence.makePhrase(4, idiom, ligature, -1, volume));
				}
				break;
			}
		}
		return marks;
	}
	static makeClause(level, idiom, ligature, volume) { // 問題作成の一部をサブルーチン化したもの 大きく返る塊を作る
		if (volume <= 0) {
			throw new Error('Unexpected Value Error');
		}
		let marks = [];
		switch (level) {
			case -1: { // 返り点なし
				let len = Math.ceil(Math.sqrt(randInt(1, volume ** 2)));
				for (let i = 0; i < len; i++) {
					marks.push(0);
				}
				break;
			} case 0: { // レ点のみ許可
				let len = Math.ceil(Math.sqrt(randInt(1, volume ** 2)));
				let binary = randInt(0, (0b1 << (len - 1)) - 1);
				for (let i = 0; i < len; i++) {
					marks.push(((0b1 << i) & binary) != 0b0 ? 1 : 0);
				}
				break;
			} case 1: { // 一二点
				let r = 12 / -(volume + 2) + 4.5;
				let span = Math.min(Math.ceil(Math.random() * r), 3); // 1 <= span <= 3
				let perOne = Math.ceil(volume / span); // 一つ当たりの volume
				let probability = 1 / -perOne + 1; // idiom と ligature の確率
				marks = [];
				let isIdiom = [];
				for (let i = 0; i < span; i++) {
					isIdiom.push(idiom && randBool(probability));
				}
				isIdiom.push(false); // オーバーフロー防止
				for (let i = 0; i < span; i++) {
					marks.push(3 + span - i);
					if (isIdiom[i]) {
						marks.push(20); // ―
					}
					if (!isIdiom[i + 1] || randBool()) {
						marks = marks.concat(Sentence.checkLastChar(Sentence.makePhrase(0, idiom, ligature, -1, isIdiom[i] ? perOne - 1 : perOne)));
					}
				}
				if (ligature && randBool(probability)) {
					marks.push(3); // 一レ
				} else {
					marks.push(2); // 一
				}
				break;
			} case 2: { // 上下点
				let span = randBool(1 / -volume + 1) ? 2 : 1;
				let perOne = Math.max(volume - span, 2); // 一つ当たりの volume
				let probability = 1 / -perOne + 1; // idiom と ligature の確率
				let need = randInt(0, span);
				marks = [];
				let isIdiom = [];
				for (let i = 0; i < span; i++) {
					isIdiom.push(idiom && randBool(probability));
				}
				isIdiom.push(false); // オーバーフロー防止
				for (let i = 0; i < span; i++) {
					marks.push(10 - i);
					if (isIdiom[i]) {
						marks.push(20); // ―
					}
					if (!isIdiom[i + 1] || randBool() || i == need) {
						marks = marks.concat(Sentence.checkLastChar(Sentence.makePhrase(1, idiom, ligature, i == need ? 1 : -1, isIdiom[i] ? perOne - 1 : perOne)));
					}
				}
				if (ligature && randBool(probability)) {
					marks.push(8); // 上レ
				} else {
					marks.push(7); // 上
				}
				break;
			} case 3: { // 甲乙点
				let r = 10 / -(volume + 2) + 4;
				let span = Math.min(Math.ceil(Math.random() * r), 3); // 1 <= span <= 3
				let perOne = Math.ceil(volume / span); // 一つ当たりの volume
				let probability = 1 / -perOne + 1; // idiom と ligature の確率
				let need = randInt(0, span);
				marks = [];
				let isIdiom = [];
				for (let i = 0; i < span; i++) {
					isIdiom.push(idiom && randBool(probability));
				}
				isIdiom.push(false); // オーバーフロー防止
				for (let i = 0; i < span; i++) {
					marks.push(12 + span - i);
					if (isIdiom[i]) {
						marks.push(20); // ―
					}
					if (!isIdiom[i + 1] || randBool() || i == need) {
						marks = marks.concat(Sentence.checkLastChar(Sentence.makePhrase(2, idiom, ligature, i == need ? (span == 3 ? 1.5 : 2) : -1, isIdiom[i] ? perOne - 1 : perOne)));
					}
				}
				if (ligature && randBool(probability)) {
					marks.push(12); // 甲レ
				} else {
					marks.push(11); // 甲
				}
				break;
			} case 4: { // 天地人点
				let span = randBool(1 / -volume + 1) ? 2 : 1;
				let perOne = Math.ceil(volume / span); // 一つ当たりの volume
				let probability = 1 / -perOne + 1; // idiom と ligature の確率
				let need = randInt(0, span);
				marks = [];
				let isIdiom = [];
				for (let i = 0; i < span; i++) {
					isIdiom.push(idiom && randBool(probability));
				}
				isIdiom.push(false); // オーバーフロー防止
				for (let i = 0; i < span; i++) {
					marks.push(17 + span - i);
					if (isIdiom[i]) {
						marks.push(20); // ―
					}
					if (!isIdiom[i + 1] || randBool() || i == need) {
						marks = marks.concat(Sentence.checkLastChar(Sentence.makePhrase(3, idiom, ligature, i == need ? 3 : -1, isIdiom[i] ? perOne - 1 : perOne)));
					}
				}
				if (ligature && randBool(probability)) {
					marks.push(17); // 一レ
				} else {
					marks.push(16); // 一
				}
				break;
			}
		}
		return marks;
	}
	static checkLastChar(marks) {
		if (WITH_RE.includes(marks[marks.length - 1])) { // 最後にレ点が来るのを検知
			marks.push(0);
		}
		return marks;
	}
	static checkReWithInIdiom(marks) {
		if (marks.length < 3) {
			return marks;
		} else {
			let i = 2;
			while (i < marks.length) {
				if (marks[i] == 20 && WITH_RE.includes(marks[i - 2])) { // レ点と熟語が連続していたら
					marks.splice(i - 1, 0, 0); // レ点と熟語の間に返り点なしの文字を挿入
				}
				i++;
			}
			return marks;
		}
	}
	static solve(marks) {
		let ans = Array(marks.length);
		let count = 1;
		let i = 0;
		while (i < marks.length) {
			if (!ans[i]) { // undefined(=まだ読んでない)なら
				if (marks[i] == 0) {
					ans[i] = count;
					count++;
					if (WITH_RE.includes(marks[i - 1]) && !COMEFROM.includes(marks[i])) { // レ点系
						ans = Sentence.traceBack(marks, ans, i - 1, count);
						count = ans.reduce(function (a, b) {return Math.max(a, b);}) + 1;
					}
				} else if (GOTO.includes(marks[i]) && !WITH_RE.includes(marks[i])) { // 戻るきっかけ系
					ans = Sentence.traceBack(marks, ans, i, count);
					count = ans.reduce(function (a, b) {return Math.max(a, b);}) + 1;
				}
			}
			i++;
		}
		return ans;
	}
	static traceBack(marks, ans, i, count) {
		ans[i] = count;
		count++;
		if (WITH_RE.includes(marks[i - 1])) {
			ans = Sentence.traceBack(marks, ans, i - 1, count);
		} else if (marks[i] == 2 || marks[i] == 3) { // 一(レ)点
			i--;
			let last = -1;
			while (i >= 0) {
				if (marks[i] >= 4 && marks[i] <= 6) { // 二三四
					ans[i] = count;
					count++;
					last = i;
					if (marks[i + 1] == 20) { // 熟語
						ans[i + 1] = count;
						count++;
					}
				} else if (!ans[i] && marks[i] != 20) { // まだ読んでないのに二三四でも熟語でもない⇒上位の返り点
					break;
				} else if (marks[i] == 2 || marks[i] == 3) { // 同位の初めのやつ
					break;
				}
				i--;
			}
			if (WITH_RE.includes(marks[last - 1])) {
				ans = Sentence.traceBack(marks, ans, last - 1, count);
			}
		} else if (marks[i] == 7 || marks[i] == 8) { // 上(レ)点
			i--;
			let last = -1;
			while (i >= 0) {
				if (marks[i] == 9 || marks[i] == 10) { // 中下
					ans[i] = count;
					count++;
					last = i;
					if (marks[i + 1] == 20) { // 熟語
						ans[i + 1] = count;
						count++;
					}
				} else if (!ans[i] && marks[i] != 20) { // まだ読んでないのに中下でも熟語でもない⇒上位の返り点
					break;
				} else if (marks[i] == 7 || marks[i] == 8) { // 同位の初めのやつ
					break;
				}
				i--;
			}
			if (WITH_RE.includes(marks[last - 1])) {
				ans = Sentence.traceBack(marks, ans, last - 1, count);
			}
		} else if (marks[i] == 11 || marks[i] == 12) { // 甲(レ)点
			i--;
			let last = -1;
			while (i >= 0) {
				if (marks[i] >= 13 && marks[i] <= 15) { // 乙丙丁
					ans[i] = count;
					count++;
					last = i;
					if (marks[i + 1] == 20) { // 熟語
						ans[i + 1] = count;
						count++;
					}
				} else if (!ans[i] && marks[i] != 20) { // まだ読んでないのに乙丙丁でも熟語でもない⇒上位の返り点
					break;
				} else if (marks[i] == 11 || marks[i] == 12) { // 同位の初めのやつ
					break;
				}
				i--;
			}
			if (WITH_RE.includes(marks[last - 1])) {
				ans = Sentence.traceBack(marks, ans, last - 1, count);
			}
		} else if (marks[i] == 16 || marks[i] == 17) { // 天(レ)点
			i--;
			let last = -1;
			while (i >= 0) {
				if (marks[i] == 18 || marks[i] == 19) { // 地人
					ans[i] = count;
					count++;
					last = i;
					if (marks[i + 1] == 20) { // 熟語
						ans[i + 1] = count;
						count++;
					}
				} else if (marks[i] == 16 || marks[i] == 17) { // 同位の初めのやつ
					break;
				}
				i--;
			}
			if (WITH_RE.includes(marks[last - 1])) {
				ans = Sentence.traceBack(marks, ans, last - 1, count);
			}
		}
		return ans;
	}
}

function loadExample() {
	let examples = document.getElementsByClassName('sentence-example');
	for (let example of examples) {
		let sent = new Sentence(example.innerHTML.split(',').map((n) => Number(n.trim())));
		example.innerHTML = sent.getExample();
	}
}
