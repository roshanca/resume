window.Swipe = function(node, options) {
	if (!node) {
		return;
	}
	var that = this;
	this.options = options || {};
	this.index = this.options.startSlide || 0;
	this.speed = this.options.speed || 300;
	this.callback = this.options.callback || function() {};
	this.delay = this.options.auto || 0;
	this.disabled = false;
	this.container = node;
	this.element = this.container.children[0];
	this.container.style.overflow = "hidden";
	this.element.style.listStyle = "none";
	this.element.style.margin = 0;
	this.element.style.position = "relative";
	this.setup();
	this.begin();
	if (this.element.addEventListener) {
		this.element.addEventListener("touchstart", this, false);
		this.element.addEventListener("touchmove", this, false);
		this.element.addEventListener("touchend", this, false);
		this.element.addEventListener("webkitTransitionEnd", this, false);
		this.element.addEventListener("msTransitionEnd", this, false);
		this.element.addEventListener("oTransitionEnd", this, false);
		this.element.addEventListener("transitionend", this, false);
		window.addEventListener("resize", this, false)
	} else {
		if (window.attachEvent) {
			window.attachEvent("onresize", function() {
				that.setup()
			})
		}
	}
};
Swipe.prototype = {
	setup: function() {
		this.slides = this.element.children;
		this.length = this.slides.length;
		if (this.length < 2) {
			return;
		}
		this.width = ("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().width : this.container.offsetWidth;
		if (!this.width) {
			this.width = this.container.getBoundingClientRect().right
		}
		if (!this.width || this.width < 0) {
			return;
		}
		this.container.style.visibility = "hidden";
		this.element.style.width = ((this.slides.length + 1) * this.width) + "px";
		var a = this.slides.length;
		while (a--) {
			var b = this.slides[a];
			b.style.width = this.width + "px";
			b.style.display = "block";
			b.style.verticalAlign = "top"
		}
		this.slide(this.index, 0);
		this.container.style.visibility = "visible"
	},
	enable: function() {
		this.disabled = false;
		if (this.element.addEventListener) {
			this.element.addEventListener("touchstart", this, false);
			this.element.addEventListener("touchmove", this, false);
			this.element.addEventListener("touchend", this, false);
			this.element.addEventListener("webkitTransitionEnd", this, false);
			this.element.addEventListener("msTransitionEnd", this, false);
			this.element.addEventListener("oTransitionEnd", this, false);
			this.element.addEventListener("transitionend", this, false)
		}
	},
	disable: function() {
		this.disabled = true;
		if (this.element.removeEventListener) {
			this.element.removeEventListener("touchstart", this, false);
			this.element.removeEventListener("touchmove", this, false);
			this.element.removeEventListener("touchend", this, false);
			this.element.removeEventListener("webkitTransitionEnd", this, false);
			this.element.removeEventListener("msTransitionEnd", this, false);
			this.element.removeEventListener("oTransitionEnd", this, false);
			this.element.removeEventListener("transitionend", this, false)
		}
	},
	slide: function(a, c) {
		var b = this.element.style;
		if (c == undefined) {
			c = this.speed
		}
		if (this.supportsTransitions()) {
			b.webkitTransitionDuration = b.MozTransitionDuration = b.msTransitionDuration = b.OTransitionDuration = b.transitionDuration = c + "ms";
			b.OTransitionTimingFunction = b.msTransitionTimingFunction = b.MozTransitionTimingFunction = b.webkitTransitionTimingFunction = "ease";
			b.MozTransform = b.webkitTransform = "translate3d(" + -(a * this.width) + "px,0,0)";
			b.msTransform = b.OTransform = "translateX(" + -(a * this.width) + "px)"
		} else {
			_this = this;
			$(this.element).animate({
				left: -(a * this.width)
			}, c, "swing", this.tranEnd)
		}
		this.index = a
	},
	tranEnd: function() {
		_this.transitionEnd(null)
	},
	getPos: function() {
		return this.index
	},
	prev: function(a) {
		this.delay = a || 0;
		clearTimeout(this.interval);
		if (this.index) {
			this.slide(this.index - 1, this.speed)
		}
	},
	next: function(a) {
		this.delay = a || 0;
		clearTimeout(this.interval);
		if (this.index < this.length - 1) {
			this.slide(this.index + 1, this.speed)
		} else {
			this.slide(0, this.speed)
		}
	},
	begin: function() {
		var a = this;
		this.interval = (this.delay) ? setTimeout(function() {
			a.next(a.delay)
		}, this.delay) : 0
	},
	stop: function() {
		this.delay = 0;
		clearTimeout(this.interval)
	},
	resume: function() {
		this.delay = this.options.auto || 0;
		this.begin()
	},
	handleEvent: function(a) {
		switch (a.type) {
			case "touchstart":
				this.disabled ? 1 : this.onTouchStart(a);
				break;
			case "touchmove":
				this.disabled ? 1 : this.onTouchMove(a);
				break;
			case "touchend":
				this.disabled ? 1 : this.onTouchEnd(a);
				break;
			case "webkitTransitionEnd":
			case "msTransitionEnd":
			case "oTransitionEnd":
			case "transitionend":
				this.transitionEnd(a);
				break;
			case "onresize":
			case "resize":
				this.setup();
				break
		}
	},
	transitionEnd: function(a) {
		if (this.delay) {
			this.begin()
		}
		this.callback(a, this.index, this.slides[this.index])
	},
	onTouchStart: function(a) {
		this.start = {
			pageX: a.touches[0].pageX,
			pageY: a.touches[0].pageY,
			time: Number(new Date())
		};
		this.isScrolling = undefined;
		this.deltaX = 0;
		this.element.style.MozTransitionDuration = this.element.style.webkitTransitionDuration = 0;
		a.stopPropagation()
	},
	onTouchMove: function(a) {
		if (a.touches.length > 1 || a.scale && a.scale !== 1) {
			return
		}
		this.deltaX = a.touches[0].pageX - this.start.pageX;
		if (typeof this.isScrolling == "undefined") {
			this.isScrolling = !! (this.isScrolling || Math.abs(this.deltaX) < Math.abs(a.touches[0].pageY - this.start.pageY))
		}
		if (!this.isScrolling) {
			a.preventDefault();
			clearTimeout(this.interval);
			this.deltaX = this.deltaX / ((!this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0) ? (Math.abs(this.deltaX) / this.width + 1) : 1);
			this.element.style.MozTransform = this.element.style.webkitTransform = "translate3d(" + (this.deltaX - this.index * this.width) + "px,0,0)";
			a.stopPropagation()
		}
	},
	onTouchEnd: function(c) {
		var b = Number(new Date()) - this.start.time < 250 && Math.abs(this.deltaX) > 20 || Math.abs(this.deltaX) > this.width / 2,
			a = !this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0;
		if (!this.isScrolling) {
			this.slide(this.index + (b && !a ? (this.deltaX < 0 ? 1 : -1) : 0), this.speed)
		}
		c.stopPropagation()
	},
	supportsTransitions: function(g) {
		var a = document.body || document.documentElement;
		var d = a.style;
		var f = "transition";
		if (typeof d[f] == "string") {
			return true
		}
		v = ["Moz", "Webkit", "Khtml", "O", "ms"], f = f.charAt(0).toUpperCase() + f.substr(1);
		for (var c = 0; c < v.length; c++) {
			if (typeof d[v[c] + f] == "string") {
				return true
			}
		}
		return false
	}
};

(function (W, D) {
	var isLogoCentered = true,
			isHistorySupported = !!(W.history && history.pushState),
			isGaugeInit = false,
			canvas = document.getElementsByTagName("canvas"),
			gaugeGroup = [],
			arcIncrements = [],
			cWidth = canvas[0].width,
			cHeight = canvas[0].height,
			baseColor = "#f8f8f8",
			coverColor = "#2178a9";

	function headerToggle() {
		if (isLogoCentered && $(W).scrollTop() > 70) {
			isLogoCentered = false;

			$("nav").animate({
				top: 0
			}, 150);

			$("header").animate({
				height: 50
			}, 150);

			$("#logo").animate({
				opacity: 0
			}, 150, resetLogo);
		} else if (!isLogoCentered && $(W).scrollTop() < 70) {
			isLogoCentered = true;

			$("nav").animate({
				top: 50
			}, 150);

			$("header").animate({
				height: 100
			}, 150);

			$("#logo").animate({
				opacity: 0
			}, 150, resetLogo);
		}
	}

	function resetLogo() {
		if (!isLogoCentered) {
			$("#logo").css({
				"margin": "0",
				"height": "50px"
			});
		} else {
			$("#logo").css({
				"margin": "0 auto",
				"height": "68px"
			});
		}

		$("#logo").animate({
			opacity: 1
		}, 150);
	}

	function scrollTo(destination, duration, distance) {
		var h = $("#" + destination).offset().top,
			t = $(window).scrollTop(),
			p = parseInt($("#" + destination).css("padding-top"));

		if (distance) h -= distance;

		$("html, body").animate({
			scrollTop: h - p
		}, duration);
	}

	function drawCanvasRound(gauge, color, sAngle, eAngle) {
		gauge.clearRect(0, 0, cWidth, cHeight);

		gauge.beginPath();
		gauge.strokeStyle = color;
		gauge.lineWidth = 27;
		gauge.arc(cWidth / 2, cHeight / 2, 55, sAngle, eAngle, false);
		gauge.stroke();
	}

	function drawCanvasStaff(gauge, arcEndStaff) {
		drawCanvasRound(gauge, baseColor, 0, Math.PI * 2);
		// drawCanvasRound(gauge, coverColor, 0 - 90 * Math.PI / 180, arcEndStaff - 90 * Math.PI / 180);

		gauge.beginPath();
		gauge.strokeStyle = coverColor;
		gauge.lineWidth = 27;
		gauge.arc(cWidth / 2, cHeight / 2, 55, 0 - 90 * Math.PI / 180, arcEndStaff - 90 * Math.PI / 180, false);
		gauge.stroke();

		// gauge.fillStyle = coverColor;
		// gauge.font = "14px PT Sans";
		// var text = Math.floor(arcEndStaff / 6.2 * 100);
		// var textWidth = gauge.measureText(text).width;
		// gauge.fillText(text, cWidth / 2 - textWidth / 2, cHeight / 2 + 5);

		return arcEndStaff;
	}

	function initCanvasStaff() {
		
		for (var i = 0, cl = canvas.length; i < cl; i++) {
			var gauge = canvas[i].getContext("2d");

			gaugeGroup.push(gauge);
			arcIncrements.push(0);

			// console.log(gaugeGroup);
			// console.log(arcIncrements);

			// drawCanvasRound(gauge, baseColor, 0, Math.PI * 2);
		}

		var drawingStaff1 = setInterval(function () {
			arcIncrements[0] += Math.PI / 180;
			var end1 = drawCanvasStaff(gaugeGroup[0], arcIncrements[0]);
			if (end1 > 5.2) {
				clearInterval(drawingStaff1);
			}
		}, 10);

		var drawingStaff2 = setInterval(function () {
			arcIncrements[1] += Math.PI / 180;
			var end2 = drawCanvasStaff(gaugeGroup[1], arcIncrements[1]);
			if (end2 > 3.9) {
				clearInterval(drawingStaff2);
			}
		}, 10);

		var drawingStaff3 = setInterval(function () {
			arcIncrements[2] += Math.PI / 180;
			var end3 = drawCanvasStaff(gaugeGroup[2], arcIncrements[2]);
			if (end3 > 4.2) {
				clearInterval(drawingStaff3);
			}
		}, 10);

		var drawingStaff4 = setInterval(function () {
			arcIncrements[3] += Math.PI / 180;
			var end4 = drawCanvasStaff(gaugeGroup[3], arcIncrements[3]);
			if (end4 > 3.8) {
				clearInterval(drawingStaff4);
			}
		}, 10);
	}

	$(D).ready(function () {

		console.log("%clook what look? hey, say you ne!", "font-size: 22px; font-shadow: 1px 2xp 1px rgba(0, 0, 0, .3)");
		$(W).on("scroll", function () {
			headerToggle();
			
			if ($("#moreSkills")[0].getBoundingClientRect().top < $(W).height() && !isGaugeInit) {
				isGaugeInit = true;
				initCanvasStaff();
			}
		});
		
		// logo
		$("#logo").on("click", function (e) {
			e.preventDefault();

			$("html, body").animate({
				scrollTop: 0
			}, 300);

			if (isHistorySupported) {
				history.pushState({
					section: undefined
				}, D.title, "/");
			}
		});

		// Navigation
		$("nav").find("a").on("click", function (e) {
			var anchor = $(this).data("anchor");

			if (anchor) {
				e.preventDefault();

				scrollTo(anchor, 300);

				if (isHistorySupported) {
					history.pushState({
						section: anchor
					}, D.title, "/" + anchor);
				}
			}
		});

		onpopstate = function (e) {
			setupPage(e.state);
		}

		function setupPage(page) { 
			if (page == null) return;

			if (page.section) {
				scrollTo(page.section, 300);
			} else {
				$("html, body").animate({
					scrollTop: 0
				}, 300);
			} 
		}

		// 头像效果
		$(".face").on("mousemove", function (e) {
			var x = e.offsetX;
			var y = e.offsetY;
			var ua = W.navigator.userAgent

			if (/\bgecko\/(\d+)/.test(ua.toLowerCase())) {
				x = e.pageX - $(this).offset().left;
				y = e.pageY - $(this).offset().top;
			}

			var top1 = y/30;
			var left1 = x/50;
			var top2 = y/15;
			var right2 = 10 - (x/35);
			var top3 = 10 - (y/10);
			var left3 = x/40;

			$(this).find("li").eq(0).css({"top": top1 + "%", "left": left1 + "%"});
			$(this).find("li").eq(1).css({"top": top2 + "%", "right": right2 + "%"});
			$(this).find("li").eq(2).css({"top": top3 + "%", "left": left3 + "%"});
		});

		// Slider
		var workSlider = new Swipe(D.getElementById('workSlider'), {
			callback: function (id, slider) {
				setSlider('work', this);
			}
		});
		
		setSlider('work', workSlider);

		function setSlider(id, slider) {
			eventOff(id);

			var tileLength = $("#" + id + "Tiles > li").length,
					ag = slider.getPos();

			if (ag == 0) {
				$("#" + id + "ArrowLeft").off("click");
				$("#" + id + "ArrowLeft").css("opacity", "0.2");
				$("#" + id + "ArrowRight").on("click", function() {
					_gaq.push(["_trackEvent", "Sliders", id.toString(), (ag + 1).toString()]);
					eventOff(id);
					slider.next();
				});
				$("#" + id + "ArrowRight").css("opacity", "1");
			} else {
				if (ag > 0 && ag != tileLength - 1) {
					$("#" + id + "ArrowLeft").on("click", function() {
						_gaq.push(["_trackEvent", "Sliders", id.toString(), (ag + 1).toString()]);
						eventOff(id);
						slider.prev();
					});
					$("#" + id + "ArrowLeft").css("opacity", "1");
					$("#" + id + "ArrowRight").on("click", function() {
						_gaq.push(["_trackEvent", "Sliders", id.toString(), (ag + 1).toString()]);
						eventOff(id);
						slider.next();
					});
					$("#" + id + "ArrowRight").css("opacity", "1")
				} else {
					$("#" + id + "ArrowLeft").on("click", function() {
						_gaq.push(["_trackEvent", "Sliders", id.toString(), (ag + 1).toString()]);
						eventOff(id);
						slider.prev();
					});
					$("#" + id + "ArrowLeft").css("opacity", "1");
					$("#" + id + "ArrowRight").off("click", function() {
						_gaq.push(["_trackEvent", "Sliders", id.toString(), (ag + 1).toString()]);
						eventOff(id);
						slider.next();
					});
					$("#" + id + "ArrowRight").css("opacity", "0.2");
				}
			}
		}

		function eventOff(id) {
			$("#" + id + "ArrowLeft").off("click");
			$("#" + id + "ArrowRight").off("click");
		}
	});

})(window, document);
