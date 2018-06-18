define(['./tools'], function (tools) {
    var current = {

        /**
         * Init sort row
         * @param {any} tableId 
         */
        initSortRow: function (tableId) {
            var $th = $('#' + tableId + ' th').get();
            for (var index = 0; index < ($th.length); index++) {
                var element = $th[index];
                if ($(element).hasClass('static')) {
                    $(element).addClass('rowSortable');
                    $(element).attr('id', index);
                    $(element).attr('data-sortable', 'down');
                    var classResume = $(element).attr('data-field');
                    var $divName = $(element).closest('div').find('.' + classResume);
                    $divName.append(' <i id="sortArrowUp" class="fa fa-long-arrow-up hidden" aria-hidden="true"></i>');
                    $divName.append(' <i id="sortArrowDown" class="fa fa-long-arrow-down hidden" aria-hidden="true"></i>');
                    current.addEventOnElement(element);
                }
            }
        },

        /**
         * Add sort event
         * 
         * @param {any} element 
         */
        addEventOnElement: function (element) {
            $(element).mouseenter(function (e) {
                var attrSortable = $(e.target).closest('th').attr('data-sortable');
                var $th;
                if ($(e.target).is('span')) {
                    $th = $(e.target).parent();
                } else {
                    $th = $(e.target);
                }
                if (attrSortable === 'up') {
                    $th.find('.fa-long-arrow-up').removeClass('hidden');
                } else {
                    $th.find('.fa-long-arrow-down').removeClass('hidden');
                }
            });
            $(element).mouseleave(function (e) {
                if (!$(e.target).closest('th').hasClass('rowSortActive')) {
                    $(e.target).closest('th').find('.fa-long-arrow-up').addClass('hidden');
                    $(e.target).closest('th').find('.fa-long-arrow-down').addClass('hidden');
                }
            });
        },

        /**
         * Load events on table
         * 
         * @param {any} tableId 
         */
        loadEvents: function (tableId) {
            $('#left-' + tableId + ' .rowSortable').on('click', function (e) {
                if ($(e.target).hasClass('btn') || $(e.target).parent().hasClass('btn') || $(e.target).hasClass('fa-calendar') || $(e.target).hasClass('resourceFilterInput') || $(e.target).hasClass('col-checkbox') || $(e.target).hasClass('cfilter-input')) {
                    return;
                }
                var attrSortable = $(e.target).closest('th').attr('data-sortable');
                var $th;
                if ($(e.target).is('span')) {
                    $th = $(e.target).parent();
                } else if ($(e.target).is('i')) {
                    $th = $(e.target).parent().parent();
                } else {
                    $th = $(e.target);
                }
                $('#left-' + tableId + ' .rowSortActive').removeClass('rowSortActive');
                $th.closest('th').addClass('rowSortActive');
                $('#left-' + tableId + ' .fa-long-arrow-up').addClass('hidden');
                $('#left-' + tableId + ' .fa-long-arrow-down').addClass('hidden');
                if (attrSortable === 'up') {
                    $th.find('.fa-long-arrow-up').addClass('hidden');
                    $th.find('.fa-long-arrow-down').removeClass('hidden');
                } else {
                    $th.find('.fa-long-arrow-up').removeClass('hidden');
                    $th.find('.fa-long-arrow-down').addClass('hidden');
                }
                var idColumn = parseInt($(this).attr('id'), 10);
                var sortable = $(this).attr('data-sortable');
                if (sortable === 'up') {
                    current.sortTable(tableId, idColumn, 'down');
                    $(this).attr('data-sortable', 'down');
                } else {
                    current.sortTable(tableId, idColumn, 'up');
                    $(this).attr('data-sortable', 'up');
                }
            });
        },

        /**
         * Sort table 
         * 
         * @param {any} tableId 
         * @param {any} id 
         * @param {any} move 
         */
        sortTable: function (tableId, id, move) {
            var rows = $('#left-' + tableId + ' tbody  tr').get();
            rows.sort(function (a, b) {
                var A = $(a).children('td').eq(id).text().toUpperCase();
                var B = $(b).children('td').eq(id).text().toUpperCase();
                if (tools.isFloat(A) && tools.isFloat(B)) {
                    if (move === 'down') {
                        if (parseFloat(A, 10) < parseFloat(B, 10)) {
                            return -1;
                        }
                        if (parseFloat(A, 10) > parseFloat(B, 10)) {
                            return 1;
                        }
                    } else {
                        if (parseFloat(A, 10) < parseFloat(B, 10)) {
                            return 1;
                        }
                        if (parseFloat(A, 10) > parseFloat(B, 10)) {
                            return -1;
                        }
                    }
                    return 0;
                } else {
                    if (move === 'down') {
                        if (A < B) {
                            return -1;
                        }
                        if (A > B) {
                            return 1;
                        }
                    } else {
                        if (A < B) {
                            return 1;
                        }
                        if (A > B) {
                            return -1;
                        }
                    }
                }
                return 0;
            });
            $.each(rows, function (index, row) {
                $('#left-' + tableId).children('tbody').append(row);
                $('#right-' + tableId).children('tbody').append($('#right-' + tableId + ' #' + $(row).attr('id')));
            });
        }

    };
    return current;
});
