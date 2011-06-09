$(document).ready(function() {
	
	var mouseDown = false,
		mouseDownTimeout = null,
		SLOWDOWN = 0.4,
		VELOCITY = 10,
		velocity = 0,
		MAXVELOCITY = 50,
		periodLocation = "";
	
	var periods = {
		y1700: 0,
		y1750: 440,
		y1800: 931,
		y1850: 1659,
		y1900: 2746,
		y1950: 4372,
		y2000: 7944
	};
	
	$("div.intro").css("width", 410);
	
	var positionUI = function () {
		var contentWidth = $("#content").width();
		var paddingWidth = (contentWidth - 960) / 2;
		$("#story").css({
			padding: "0 0 0 " + (paddingWidth < 0) ? 0 : paddingWidth + "px",
			backgroundPosition: paddingWidth + "px 0"
		});
		$("#navigator, #navigator-bg").css({
			display: "block",
			float: "none",
			top: "483px",
			left: (contentWidth / 2 - 208) + "px",
			marginTop: 0
		});
		var arrowPosition = parseInt(contentWidth / 2) - 245;
		$("div.story-arrow.left, div.story-arrow-bg.left").css("left", arrowPosition + "px");
		$("div.story-arrow.right, div.story-arrow-bg.right").css("right", arrowPosition + "px");
	};
	
	$("#story-scroller")
		.css({
			overflow: "hidden",
			position: "relative"
		})
		.after('<div class="story-arrow-bg left"></div>')
		.after('<div class="story-arrow left"></div>')
		.after('<div class="story-arrow-bg right"></div>')
		.after('<div class="story-arrow right"></div>')
		.show();
	
	$("#story").mouseover(function () {
		$(".popup").remove();
	});
	
	$("div.period ol").css({
		margin: 0
	});
	$("div.period ol li").css({
		position: "absolute",
		margin: 0
	}).css("left", function () {
		var periodDiv = $(this).parent().parent();
		var periodClass = periodDiv.attr("id").match(/y([0-9]{4})/);
		var yearClass = $(this).attr("class").match(/y([0-9]{4})/);
		if (periodClass && periodClass[1] && yearClass && yearClass[1]) {
			var width = periodDiv.width();
			if (periodClass[1] == "2000") {
				return ((yearClass[1] - periodClass[1]) * 2 / 25 * width) - 9 + "px";
			} else {
				return ((yearClass[1] - periodClass[1]) * 2 / 100 * width) - 9 + "px";
			}
		}
	});
	
	if ($.browser.msie) {
		$("#story").bind("selectstart", function () { return false; });
	}
	
	var startScroll = function (button, directionFunction) {
		$(button).addClass("active");
		$(".popup").remove();
		mouseDown = true;
		velocity = VELOCITY
		window.clearTimeout(mouseDownTimeout);
		mouseDownTimeout = window.setTimeout(directionFunction, 10);
	};
	
	var stopScroll = function () {
		$(this).removeClass("active");
		mouseDown = drag = false;
	};
	
	$("div.story-arrow.left")
		.mousedown(function () {
			startScroll(this, moveLeft);
		}).mouseup(stopScroll).mouseout(stopScroll);
	$("div.story-arrow.right")
		.mousedown(function () {
			startScroll(this, moveRight);
		}).mouseup(stopScroll).mouseout(stopScroll);
	
	var moveRight = function () {
		$("#story-scroller")[0].scrollLeft = $("#story-scroller")[0].scrollLeft + velocity;
		if (mouseDown) {
			mouseDownTimeout = window.setTimeout(moveRight, 10);
		} else if (velocity > 0) {
			velocity -= SLOWDOWN;
			mouseDownTimeout = window.setTimeout(moveRight, 10);
		} else {
			updateNavigatorHighlight();
		}
	};
	
	var moveLeft = function () {
		$("#story-scroller")[0].scrollLeft = $("#story-scroller")[0].scrollLeft - velocity;
		if (mouseDown) {
			mouseDownTimeout = window.setTimeout(moveLeft, 10);
		} else if (velocity > 0) {
			velocity -= SLOWDOWN;
			mouseDownTimeout = window.setTimeout(moveLeft, 10);
		} else {
			updateNavigatorHighlight();
		}
	};
	
	$("#navigator a").click(function () {
		$(".popup").remove();
		velocity = 0;
		var period = $(this).attr("href").substr(1);
		$("#story-scroller").animate({
			scrollLeft: 825 + periods[period]
		}, 500, "swing", updateNavigatorHighlight);
		return false;
	});
	
	$(window).resize(positionUI);
	positionUI();
	
	/* drag to scroll interface */
	
	var drag, oldDrag = false;
	$("div#story").mousedown(function (e) {
		velocity = oldDrag = 0;
		drag = e.clientX;
	}).mouseup(function () {
		if (drag && oldDrag && velocity == 0) {
			velocity = oldDrag - drag;
			drag = oldDrag = mouseDown = false;
			if (velocity > 0) {
				if (velocity > MAXVELOCITY) {
					velocity = MAXVELOCITY;
				}
				moveRight();
			} else {
				velocity = Math.abs(velocity);
				if (velocity > MAXVELOCITY) {
					velocity = MAXVELOCITY;
				}
				moveLeft();
			}
		}
	}).mousemove(function (e) {
		if (drag) {
			velocity = 0;
			$("#story-scroller")[0].scrollLeft = $("#story-scroller")[0].scrollLeft - (e.clientX - drag);
			oldDrag = drag;
			drag = e.clientX;
		}
	}).css("cursor", "move");
	
	$(document).mouseup(function () {
		drag = false;
	});
	
	/* popup */
	
	$("div.period a").hover(function () {
		if (!mouseDown && velocity <= 0) {
			$(".popup").remove();
			var that = $(this);
			var period = that.parent().parent().parent().attr("id").substr(1);
			var year = that.parent().attr("class").match(/y[0-9s-]+/);
			if (period && year) {
				var position = $(this).offset();
				that.addClass("doingRequest");
				$.get(periodLocation + "thestory-" + period + ".html", function (data) {
					if (that.hasClass("doingRequest")) {
						var li = data.match(new RegExp('<li id="' + year + '">([\\s\\S]+?)</li>'));
						if (li && li[1]) {
							var copy = li[1].match(/<p>([\s\S]+?)<\/p>/);
							var img = li[1].match(/<img/);
							var flv = li[1].match(/<embed/);
							if ((copy && copy[1]) || (img && img[1])) {
								var yearPath = String(year).substr(1);
								$("#content").after(
									'<div class="popup"><div>' +
									(img || flv ? '<img src="/en-row/img/story/' + yearPath + '/' + yearPath + '-T.jpg">' : '') +
									(copy && copy[1] ? '<p>' + copy[1].substr(0, 80 + copy[1].substr(80).indexOf(" ")) + '...</p>' : '') +
									'</div></div>'
								);
								var left = position.left - 6;
								var contentWidth = $("#content").width();
								if (left + 231 > contentWidth) {
									left = contentWidth - 231;
								}
								$(".popup").css({
									left: left + "px",
									top: (position.top - $(".popup").height() - 16) + "px",
									display: "block"
								});
							}
						}
					}
					that.removeClass("doingRequest");
				});
			}
		}
	}, function () {
		$(".popup").remove();
		$(this).removeClass("doingRequest");
	}).click(function () {
		$(".popup").remove();
		$(this).removeClass("doingRequest");
		var year = $(this).parent().attr("class").match(/y[0-9s-]+/);
		if (year) {
			showDetailDialog(year);
		}
		return false;
	});
	
	/* info dialog */
	
	var showDetailDialog = function (year) {
		
		var period = parseInt(String(year).substr(1, 4) / 50) * 50;
		$.get(periodLocation + "thestory-" + period + ".html", function (data) {
			var li = data.match(new RegExp('<li id="' + year + '">([\\s\\S]+?)</li>'));
			if (li && li[1]) {
				var title = li[1].match(/<h2>([\s\S]+?)<\/h2>/);
				var copy = li[1].match(/<p>([\s\S]+?)<\/p>/);
				var imgSrc = li[1].match(/<img[\s\S]+?src="([^"]+)"[\s\S]*?>/);
				var imgAlt = li[1].match(/<img[\s\S]+?alt="([^"]+)"[\s\S]*?>/);
				var flvSrc = li[1].match(/<embed(?:.|[\r\n])+?videoFileName=([^&"]+)/);
				var flvAlt = li[1].match(/<embed(?:.|[\r\n])+?alt="([^"]+)/);
				
				if (title && title[1] && (
					(copy && copy[1]) ||
					(imgSrc && imgSrc[1]) ||
					(flvSrc && flvSrc[1])
				)) {
					
					var content = 
						(imgSrc || flvSrc ? '<img src="/en-row/img/story/share-this.png" alt="Share this" id="share-this">' : "") +
						(imgSrc || flvSrc ? '<div id="media">' : "") +
						(imgSrc && imgSrc[1] ? '<div class="img"><img src="' + imgSrc[1] + '">' + (imgAlt && imgAlt[1] ? '<p>' + imgAlt[1] + '</p>' : "") + '</div>' : "") +
						(flvSrc && flvSrc[1] ? '<div class="video"><div id="video"></div>' + (flvAlt && flvAlt[1] ? '<p>' + flvAlt[1] + '</p>' : "") + '</div>' : "") +
						(imgSrc || flvSrc ? '</div>' : "") +
						'<h3>' + String(year).match(/y([0-9]{4}s?)/)[1] + '</h3>' +
						'<h4>' + title[1] + '</h4>' +
						(copy && copy[1] ? '<p>' + copy[1] + '</p>' : '') +
						'<br style="clear: both;">';
					
					GUINNESS.dialog.show(year, "", content, "detail");
					
					$("#dialog h2").unbind().click(function () {
						GUINNESS.track("page", "Story", "Story");
						$("#overlay, #dialog").remove();
						document.location.replace("#");
					});
					
					if (flvSrc && flvSrc[1]) {
						var so = new SWFObject("/Documents/Flash/VideoPlayer.swf", "video", "330", "248", "9", "#181415");
						so.addVariable("basePath", "");
						so.addVariable("videoFileName", flvSrc[1]);
						so.addVariable("playerType", "mini");
						so.addParam("scale", "noscale");
						so.addParam("salign", "tl");
						so.addParam('wmode', 'transparent');
						so.write("video");
					}
					
					$("img#share-this").click(function () {
						if (imgSrc && imgSrc[1]) {
							var imageFilename = imgSrc[1].match(/^(.+)-t2\.jpg$/)[1];
							GUINNESS.share.show({
								small: imageFilename + "-S.jpg",
								medium: imageFilename + "-M.jpg",
								large: imageFilename + "-L.jpg"
							}, "picture", null, String(year).substr(1));
						} else if (flvSrc && flvSrc[1]) {
							GUINNESS.share.show(flvSrc[1], "video", null, String(year).substr(1));
						} else {
							GUINNESS.share.show();
						}
					});
				}
			}
			GUINNESS.track("page", String(year).substr(1), "Story");
		});
		
	};
	
	var updateNavigatorHighlight = function () {
		$("#navigator a").removeClass("active");
		var scrollPosition = $("#story-scroller")[0].scrollLeft - 412;
		for (var foo = 1700; foo <= 2000; foo += 50) {
			if (scrollPosition > periods["y" + foo] && (!periods["y" + (foo + 50)] || scrollPosition <= periods["y" + (foo + 50)])) {
				$("#navigator li#np-" + foo + " a").addClass("active");
				break;
			}
		}
	};
	
	/* Go */
	
	var year = window.location.hash.match(/[py][0-9-]{4,}/) || window.name.match(/[py][0-9-]{4,}/) || null;
	if (year) {
		var period = parseInt(String(year).substr(1, 4) / 50) * 50;
		$("#story-scroller")[0].scrollLeft = 825 + periods["y" + period];
		showDetailDialog(year);
	}
	updateNavigatorHighlight();
});
