$(document).ready(function() {
    var rowCount = 20;
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

    // COLUMN SORTABLE
    $('.column-sortable').on('mouseenter', function(e) {
        var $target = $(e.target).is('span') || $(e.target).is('div') ? $(e.target).parent() : $(e.target);
        $target.addClass('sortable');
    });
    $('.column-sortable').on('mouseleave', function(e) {
        var $target = $(e.target).is('span') || $(e.target).is('div') ? $(e.target).parent() : $(e.target);
        $target.removeClass('sortable');
    });



    // SORTABLE

    var idSortable = -1;
    var trOpposite;
    $("table tbody").sortable({
        start: function(e, ui) {
            var target = $(ui.item[0]);
            idSortable = target.attr('data-position');
            trOpposite = $('#' + $(e.target).attr('data-opposite-side') + '-table tr[data-position=' + idSortable + ']');
        },
        update: function(e, ui) {
            var $nextElement = $('#' + $(e.target).attr('data-opposite-side') + '-table tr[data-position=' + $(ui.item[0].nextElementSibling).attr('data-position') + ']');
            trOpposite.insertBefore($nextElement);
            $(this).children().each(function(index) {
                $(this).find('td').last().html(index + 1)
            });
        }
    });

    // RESIZABLE

    var headers = {};
    var mouseStart = -1;
    var mouseEnd = -1;
    var id = -1;
    $('.resize-border').closest('th').each(function(i, e) {
        var $e = $(e);
        var $resizeBar = $e.find('.resize-border');
        var id = parseInt($resizeBar.attr('data-id'), 10);
        headers[id] = {
            width: 250
        };
        $e.css({
            'width': headers[id].width + 'px',
            'max-width': headers[id].width + 'px',
            'min-width': headers[id].width + 'px'
        });
        $e.closest('table').find('tr td:nth-child(' + ($e.index() + 1) + ')').css({
            'width': headers[id].width + 'px',
            'max-width': headers[id].width + 'px',
            'min-width': headers[id].width + 'px'
        });

        $resizeBar.height($e.height());
    });

    $('.resize-border').draggable({
        start: function(e) {
            var target = $(e.target);
            id = target.attr('data-id');
            mouseStart = $(this).offset().left;
            $('.resize-vertical-bar').show();
        },

        drag: function(e) {
            $('.resize-vertical-bar').css('left', $(this).offset().left);
        },

        stop: function(e) {
            mouseEnd = $(this).offset().left;
            var diff = mouseEnd - mouseStart;
            headers[id].width = headers[id].width + diff;
            headers[id].width = headers[id].width < 100 ? 100 : headers[id].width;
            var $target = $(e.target);
            $target.closest('th').css({
                'width': headers[id].width + 'px',
                'max-width': headers[id].width + 'px',
                'min-width': headers[id].width + 'px'
            });

            $target.closest('table').find('tr td:nth-child(' + ($target.closest('th').index() + 1) + ')').css({
                'width': headers[id].width + 'px',
                'max-width': headers[id].width + 'px',
                'min-width': headers[id].width + 'px'
            });
            // reinit vars
            $('.resize-vertical-bar').hide();
            $target.css('left', '0');
            $target.css('top', '0');
        }
    })
});