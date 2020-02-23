$(document).ready(() => {
  $('div').load('res/map.svg', function() {
      let gg = $("g g");

      // Set poppers
      gg.each(function() {
        let element = $(this);

        let title = element.find('title').html();
        let desc = element.find('desc').html();

        element.attr("data-toggle", "popover");
        element.attr("title", title);
        element.attr("data-content", desc);
        element.popover();
      })

      // Set hover
      gg.mouseenter(function() {
        let id = $(this).attr('id');
        $("#country-name").text(id);
        $(this).css("opacity", "0.5");
      }).mouseout(function() {
        $("#country-name").text("");
        $(this).css("opacity","1.0");
      });

      var clicked = false;
      var clickX = 0;
      var clickY = 0;

      var size = 1;
      var svg = $('svg');
      svg.attr('width', '100%');
      svg.attr('height', '100%');

      let map = $('div');

      map.mousemove(function(e) {
        if (clicked) {
          $('html').css('cursor', 'grabbing');

          map.scrollLeft(map.scrollLeft() + (clickX - e.pageX));
          map.scrollTop(map.scrollTop() + (clickY - e.pageY));

          clickX = e.pageX;
          clickY = e.pageY;
        }
      }).mousedown(function(e) {
        clicked = true;
        clickX = e.pageX;
        clickY = e.pageY;
      }).bind('mousewheel', function(e) {
        let scale = 0.75;
        if (e.originalEvent.wheelDelta > 0)
          scale = 1 / scale;

        let w = e.pageX - map.position().left;
        let h = e.pageY - map.position().top;

        size *= scale;
        if (size < 1) {
          scale /= size;
          size = 1;
        }

        svg.attr('width', (size * 100) + '%');
        svg.attr('height', (size * 100) + '%');

        map.scrollLeft((map.scrollLeft() + w) * scale - w);
        map.scrollTop((map.scrollTop() + h) * scale - h);
      }).mouseup(function() {
        clicked = false;
        $('html').css('cursor', 'auto');
      });
  });
});
