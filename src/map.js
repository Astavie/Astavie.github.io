$(document).ready(() => {
  $('body').load('src/map.svg', function() {
      let gg = $("g g");

      // Set poppers
      gg.each(function() {
        let element = $(this);
        let id = element.attr('id');
        element.attr("data-toggle", "popover");
        element.attr("title", id);
        element.attr("data-content", "This is a country");
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

      let map = $(document);

      map.mousemove(function(e) {
        if (clicked) {
          $('html').css('cursor', 'grabbing');

          map.scrollLeft(map.scrollLeft() + (clickX - e.pageX));
          map.scrollTop(map.scrollTop() + (clickY - e.pageY));

          clickX = e.pageX - map.scrollLeft();
          clickY = e.pageY - map.scrollTop();
        }
      }).mousedown(function(e) {
        clicked = true;
        clickX = e.pageX - map.scrollLeft();
        clickY = e.pageY - map.scrollTop();
        console.log(clickX + ", " + clickY);
      }).bind('mousewheel', function(e) {
        let scale = 0.9;
        if (e.originalEvent.wheelDelta > 0)
          scale = 1 / scale;

        let w = e.pageX;
        let h = e.pageY;

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
