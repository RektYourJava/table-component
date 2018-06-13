$(document).ready(function() {
    var rowCount = 18;
    $('#left-table tr').each(function(e) {
        rowCount += $(this).height();
    });
    $('#scrollbar').css({ 'height': rowCount });
    var eventTriggerer;

    var scrollFunction = function(event) {
        if (eventTriggerer && eventTriggerer !== "scroll-content") {
            eventTriggerer = "";
            return false;
        }
        var oppositeSide = $(event.target).attr("data-opposite-side");
        eventTriggerer = "scroll-content";
        $('#' + oppositeSide + '-table tbody').off('scroll');
        $('#scroll-container').scrollTop($(this).scrollTop());
        $('#' + oppositeSide + '-table tbody').scrollTop($(this).scrollTop());
    };

    // $(window).bind('mousewheel DOMMouseScroll', function(event) {
    //     if (event.ctrlKey == true) {
    //         event.preventDefault();
    //     }
    // });

    $('#left-table tbody').on('scroll', scrollFunction);
    $('#right-table tbody').on('scroll', scrollFunction);

    $('#left-table tbody').on('mouseenter', function(e) {
        $('#left-table tbody').on('scroll', scrollFunction);
    });

    $('#right-table tbody').on('mouseenter', function(e) {
        $('#right-table tbody').on('scroll', scrollFunction);
    });

    $('#scroll-container').on('scroll', function(e) {
        if (eventTriggerer && eventTriggerer !== "scrollbar") {
            eventTriggerer = "";
            return false;
        }
        eventTriggerer = "scrollbar";

        $('#left-table tbody').off('scroll');
        $('#left-table tbody').scrollTop($(this).scrollTop());
        $('#left-table tbody').on('scroll', scrollFunction);

        $('#right-table tbody').off('scroll');
        $('#right-table tbody').scrollTop($(this).scrollTop());
        $('#right-table tbody').on('scroll', scrollFunction);
    });
});