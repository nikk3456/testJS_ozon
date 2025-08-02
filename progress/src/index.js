function animate({ animateCallback, animateDuration, endCallback }) {	
	if (!animateDuration && typeof animateDuration !== "number") {
		throw new Error("animateDuration is required");
	}
	if (typeof animateCallback !== "function") {
		throw new Error("animateCallback is required");
	}

	const startTime = performance.now();
	let isFirstStep = true;

	function loop() {
		const currentTime = performance.now();
		const elapsedTime = currentTime - startTime; // сколько времени прошло с начала анимации
		let progress = elapsedTime / animateDuration;
		progress = parseFloat(progress.toFixed(4));

		if (isFirstStep === true) {
			isFirstStep = false;
			progress = 0;
		}

		if (progress > 1) {
			progress = 1;
			animateCallback(progress); // Вызов callback в процессе анимации

			if (endCallback) {
				endCallback(); // Вызов endCallback в конце анимации
			}
		}

		if (progress < 1) {
			animateCallback(progress); // Вызов callback в процессе анимации
			requestAnimationFrame(loop); // Рекурсивный вызов с использованием requestAnimationFrame
		}
	}

	requestAnimationFrame(loop); // Запуск анимации
}

class ProgressBlock {
	#nodes = {
		progress: null,
		progressbarTrack: null,
		progressbarThumb: null,
		progressbarText: null,
		progressbarPercent: null,
		progressbarPercentExtraText: null,
	};
	#isAnimate = false;
	#isHidden = false;

	get statusHidden() {
		return this.#isHidden;
	}

	get statusAnimate() {
		return this.#isAnimate;
	}

	constructor() {
		this.#init();
	}

	create(wrapperElement) {
		wrapperElement.textContent = '';
		wrapperElement.append(this.#nodes.progress);
	}

	animate({ percent, duration, endCallback }) {
		if (this.#isAnimate === true) {
			throw new Error('Анимация уже идёт');
		}

		this.#isAnimate = true;
		animate({
			animateCallback: (progress) => {
				this.#setPercent(Math.round(percent * progress));
			},
			endCallback: () => {
				this.#isAnimate = false;
				endCallback();
			},
			animateDuration: duration
		});
	}

	hide() {
		this.#isHidden = true;
		this.#nodes.progress.classList.add("progressbar_hidden");
	}

	unhide() {
		this.#isHidden = false;
		this.#nodes.progress.classList.remove("progressbar_hidden");
	}

	#init() {
		const {
			progress,
			progressbarTrack,
			progressbarThumb,
			progressbarText,
			progressbarPercent,
			progressbarPercentExtraText
		} = this.#createElement();

		this.#nodes = {
			progress,
			progressbarTrack,
			progressbarThumb,
			progressbarText,
			progressbarPercent,
			progressbarPercentExtraText
		};
	}

	#createElement() {
		const svgNamespace = "http://www.w3.org/2000/svg"; // Указываем пространство имен для SVG

		const progress = document.createElementNS(svgNamespace, "svg");
		progress.classList.add("progressbar");
		progress.setAttribute("viewBox", "0 0 62 62");
		progress.style.setProperty("--opacityThumb", "1");
		progress.style.setProperty("--percent", "0");

		const progressbarTrack = document.createElementNS(svgNamespace, "circle");
		progressbarTrack.setAttribute("cx", "31");
		progressbarTrack.setAttribute("cy", "31");
		progressbarTrack.classList.add("progressbar__track");

		const progressbarThumb = document.createElementNS(svgNamespace, "circle");
		progressbarThumb.setAttribute("cx", "31");
		progressbarThumb.setAttribute("cy", "31");
		progressbarThumb.classList.add("progressbar__thumb");

		const progressbarText = document.createElementNS(svgNamespace, "text");
		progressbarText.setAttribute("x", "31");
		progressbarText.setAttribute("y", "31");
		progressbarText.setAttribute("dominant-baseline", "middle");
		progressbarText.setAttribute("text-anchor", "middle");
		progressbarText.classList.add("progressbar__text");

		const progressbarPercent = document.createElementNS(svgNamespace, "tspan");
		progressbarPercent.textContent = "0";

		const progressbarPercentExtraText = document.createElementNS(svgNamespace, "tspan");
		progressbarPercentExtraText.textContent = "%";

		progressbarText.append(progressbarPercent, progressbarPercentExtraText);
		progress.append(progressbarTrack, progressbarThumb, progressbarText);

		return {
			progress,
			progressbarTrack,
			progressbarThumb,
			progressbarText,
			progressbarPercent,
			progressbarPercentExtraText
		};
	}

	#setPercent(percent) {
		this.#nodes.progressbarPercent.textContent = percent;
		this.#nodes.progress.style.setProperty("--percent", percent);
	}
}

const wrapperElement = document.querySelector(".wrapper");
const btnAnimateStartElement = document.querySelector(".btn-animate-start");
const inputPercentElement = document.querySelector(".input-percent");
const btnHiddenElemet = document.querySelector(".btn-hidden");
const btnUnhiddenElemet = document.querySelector(".btn-unhidden");
const progressBlock = new ProgressBlock();

progressBlock.create(wrapperElement);

btnAnimateStartElement.addEventListener("click", () => {
	const percent = inputPercentElement.value;
	const validPercent = percent >= 0 && percent <= 100;

	if (validPercent) {
		progressBlock.animate({
			percent,
			duration: 2000,
			endCallback: () => {
				btnAnimateStartElement.disabled = false;
			}
		});
	}
	btnAnimateStartElement.disabled = true;
});

btnUnhiddenElemet.disabled = true;

btnHiddenElemet.addEventListener("click", () => {
	btnHiddenElemet.disabled = true;
	btnUnhiddenElemet.disabled = false;
	progressBlock.hide();
});

btnUnhiddenElemet.addEventListener("click", () => {
	btnUnhiddenElemet.disabled = true;
	btnHiddenElemet.disabled = false;
	progressBlock.unhide();
});
