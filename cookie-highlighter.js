var myTimer;
var updateTime = 1000;
Number.prototype.toHHMMSS = function () {
	var seconds = Math.ceil(this),
		hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	var minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	var str = "";
	if (hours) str = str + hours + 'h ';
	if (hours || minutes) str = str + minutes + 'm ';
	str = str + seconds + 's ';
	return str;
}
var optBuilding = function (target, cookies, cookiesPs) {
	var stateAfterBought = [];
	for (var i = Game.ObjectsN; i--;) {
		var product = Game.ObjectsById[i];
		if (i == target.id) {
			/* Not buy any other product, just wait & buy target */
			stateAfterBought[i] = {
				id: i,
				time: ((target.price - cookies) / cookiesPs),
				cookies: 0,
				cookiesPs: (cookiesPs + target.storedCps)
			};
		} else if (product.price > target.price) {
			/* This product is more expansive than target, exclude. */
			stateAfterBought[i] = {
				id: null,
				time: Number.MAX_VALUE,
				cookies: null,
				cookiesPs: null
			};
		} else if (product.price > cookies) {
			/* wait & buy some product(optimizable) then wait & buy target */
			var afterBp = optBuilding(product, cookies, cookiesPs);
			stateAfterBought[i] = {
				id: afterBp.id,
				time: afterBp.time + ((target.price - afterBp.cookies) / afterBp.cookiesPs),
				cookies: 0,
				cookiesPs: (afterBp.cookiesPs + target.storedCps)
			};
		} else {
			/* buy some product then wait & buy target */
			stateAfterBought[i] = {
				id: i,
				time: ((target.price - (cookies - product.price)) / (cookiesPs + product.storedCps)),
				cookies: 0,
				cookiesPs: (cookiesPs + product.storedCps + target.storedCps)
			};
		}
	}
	var times = stateAfterBought.map(function (el) {
		return el.time;
	});
	var minTimeId = times.indexOf(Math.min.apply(Math, times));
	return stateAfterBought[minTimeId];
};
var highlighter = function () {
	var titleColor = [];
	for (var i = Game.ObjectsN; i--; titleColor[i] = "") {}
	var CP = Game.ObjectsById.map(function (product) {
		return (product.storedCps / product.price);
	});
	var bestProductId = CP.indexOf(Math.max.apply(Math, CP));
	var bestProduct = Game.ObjectsById[bestProductId];
	var newTime = 1000;
	timeDiv = document.getElementById('time');
	if (timeDiv) {
		timeDiv.parentElement.removeChild(timeDiv);
	}
	if (bestProduct.price > Game.cookies) {
		opt = optBuilding(bestProduct, Game.cookies, Game.cookiesPs);
		titleColor[opt.id] = "Lime";
		var waitTime = Number(opt.time);
		if (waitTime > 0 && waitTime != Number.MAX_VALUE) {
			optProd = document.querySelectorAll(".product")[bestProductId];
			optProd.innerHTML = optProd.innerHTML +
				'<div id="time" style="position:absolute;top:3px;right:3px;color:yellow">' +
				waitTime.toHHMMSS() + '</div>';
			var shift = Math.abs((waitTime + 0.5) % 1 - 0.5);
			if (waitTime < 1 || shift > 0.1) {
				newTime = (waitTime * 1000) % 1000;
			}
		}
	}
	titleColor[bestProductId] = "yellow";
	var titles = document.querySelectorAll(".product .title:first-child");
	[].forEach.call(titles, function (title, id) {
		title.style.color = titleColor[id];
	});
	if (updateTime != newTime) {
		window.clearInterval(myTimer);
		myTimer = window.setInterval(highlighter, newTime);
		updateTime = newTime;
	}
};
document.getElementById('sectionRight').onclick = function () {
	setTimeout(highlighter, 50);
};
myTimer = window.setInterval(highlighter, updateTime);
highlighter();