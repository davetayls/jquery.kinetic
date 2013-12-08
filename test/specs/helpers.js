/*global $ */
/**
 * Checks to see if the event listener is attached to the element
 * @param  {[type]}  $el           The element to check on
 * @param  {[type]}  eventListener The listener function
 * @return {Boolean}
 */
function hasEventAttached($el, eventListener){
	var events = $el.data('events'),
		found = false;
	if (events){
		for (var key in events){
			if (events.hasOwnProperty(key)){
				$(events[key]).each(function(){
					if (this === eventListener){
						found = true;
						return false;
					}
				});
			}
		}
	}
	return found;
}

function dragOver($el, target, from, to){
	var mdEvent = $.Event('mousedown'),
		muEvent = $.Event('mouseup'),
		mmEvent = $.Event('mousemove'),
		tsEvent = $.Event('touchstart'),
		teEvent = $.Event('touchend'),
		tmEvent = $.Event('touchmove');

		// mouse
		$.extend(mdEvent, {
			target: target,
      which: 1,
			clientX: from[0],
			clientY: from[1]
		});
		$.extend(mmEvent, {
			target: target,
      which: 1,
			clientX: to[0],
			clientY: to[1]
		});

		// touch
		$.extend(tsEvent, {
			target: target,
			originalEvent: {
				touches: [
					{
						clientX: from[0],
						clientY: from[1]
					}
				]
			}
		});
		$.extend(tmEvent, {
			target: target,
			originalEvent: {
				touches: [
					{
						clientX: to[0],
						clientY: to[0]
					}
				]
			}
		});

	if ($.support.touch){
		$el
			.trigger(tsEvent)
			.trigger(tmEvent)
			.trigger(teEvent);
	} else {
		$el
			.trigger(mdEvent)
			.trigger(mmEvent)
			.trigger(muEvent);
	}
}
