/**
 * Filters for tables
 * 
 * Used for all tables (in planning view) except the planning table
 * 
 * Some events are fired but are not necessaril used 
 * 
 * @see TaskFilter to see a filter of tasks for the planning table
 * @see CFilterConfig It's the configuration object of this CFilter class
 */
define(function() {
    function CFilter($container, config) {
        var self = this;
        self.VIDE = '&lt;Vide&gt;';
        self.observers = {};
        self.container = $container;
        self.config = config;
        /**
         * Enables the filter 
         */
        self.enableFilter = function() {
            if (!$container.hasClass('cfiltered')) {
                $container.addClass('cfiltered');
                $container.find('.cfilter-input-container.hidden').each(function(index, el) {
                    var $el = $(el);
                    if ($el.hasClass('hidden')) {
                        $el.attr('wasHidden', 'true');
                        $el.removeClass('hidden');
                    }
                });
            }
            self.fire('beforeEnabling');
            var $inputContainer = $container.find('.cfilter-input-container');
            $inputContainer.each(function(index, el) {
                self.applyFilter($(el));
            });
            self.fire('afterEnabling');
        };
        /**
         * 
         * 
         */
        self.disableFilter = function() {
            self.fire('beforeDisabling');
            self.reinitInputs();
            self.container.find('.cfilter-input').each(function(index, el) {
                var $el = $(el);
                var $inputContainer = $el.closest('.cfilter-input-container');
                $inputContainer.text($el.attr('placeholder'));
                $inputContainer.append(' <i id="sortArrowUp" class="fa fa-long-arrow-up hidden" aria-hidden="true"></i>');
                $inputContainer.append(' <i id="sortArrowDown" class="fa fa-long-arrow-down hidden" aria-hidden="true"></i>');
                if ($inputContainer.attr('wasHidden') === 'true') {
                    $inputContainer.addClass('hidden');
                    $inputContainer.removeAttr('wasHidden');
                }
                $el.remove();
            });
            self.container.find('.filter-hidden').removeClass('filter-hidden');
            self.container.removeClass('cfiltered');
            self.fire('afterDisabling');
        };
        /**
         * 
         * 
         * @param {jquery} $inputContainer The input container where the input will be injected
         */
        self.applyFilter = function($inputContainer) {
            self.fire('beforeApplyingFilter');
            var filters = {
                // These are the function that will be called according to the cfilter type in the html container
                // This is the list of function that creates the element and renders it
                inputInject: {
                    text: 'injectInput',
                    combo: 'injectCombo',
                    date: 'injectDate',
                    number: 'injectInput'
                },
                // This is the list of events that will be trigger when typing a letter in the input
                inputEvent: {
                    text: 'applyEventInput',
                    combo: 'applyEventCombo',
                    date: 'applyEventDate',
                    number: 'applyEventNumber'
                }
            };
            var filterType = $inputContainer.data('cfilter-type');
            var sourceClass = $inputContainer.data('cfilter-source-class');
            // sourceClass is the field on which we want to filter
            // an inputFilter is a filter that will get the correct field of an object (like a task which has a field name we have an input filter that is configure with a function that gets the task.name)
            var inputFilter = self.config.inputFilters[sourceClass];
            inputFilter.sourceClass = sourceClass;
            if (filterType) {
                // We inject the jquery input in the input container
                var $input = self[filters.inputInject[filterType]]($inputContainer, filterType);
                // We load the event of it
                self[filters.inputEvent[filterType]]($input, inputFilter);
            }
            self.fire('afterApplyingFilter');
        };
        /**
         * Injects a text input 
         * Can be used to type text or numbers that's why we have a parameter "type"
         * 
         * @param {any} $inputContainer The input container we want to inject the input in
         * @param {any} type text or number 
         * @returns 
         */
        self.injectInput = function($inputContainer, type) {
            self.fire('beforeInjectingInput', [$inputContainer]);
            var $input = $inputContainer.find('input.cfilter-input');
            if (!$input.length) {
                var placeholder = $inputContainer.text();
                $inputContainer.text('');
                $input = $('<input class="cfilter-input" type="text" placeholder="' + placeholder + '" data-cfilter-type="' + type + '"></input>');
                $inputContainer.addClass('cfilter-input-container-' + type).append($input);
            }
            self.fire('afterApplyingFilter', [$input]);
            return $input;
        };
        /**
         * Gets all distinct values of a column that can be selected in a select2
         * 
         * @param {any} $input 
         * @returns 
         */
        self.getPossibilities = function($input) {
            // A optimiser en stockant la data et à changer que s'il y a un updateFilter
            var filterSourceClass = $input.closest('.cfilter-input-container').data('cfilter-source-class');
            var inputFilter = self.config.inputFilters[filterSourceClass];
            var data = {
                results: [{
                    id: 0,
                    text: self.VIDE
                }]
            };
            var i = 1;
            var theData = self.getData();
            theData.forEach(function(element) {
                var text = inputFilter.getData(element);
                if (!text) {
                    return;
                }
                var seen = false;
                for (var value in data.results) {
                    if ({}.hasOwnProperty.call(data.results, value) && data.results[value].text === text) {
                        seen = true;
                        break;
                    }
                }
                if (!seen) {
                    data.results.push({
                        id: i++,
                        text: text
                    });
                }

            }, self);
            if (data.results.length > 1) {
                data.results.sort(function(a, b) {
                    return a.text.localeCompare(b.text);
                });
            }
            return data;
        };
        /**
         * 
         * 
         * @param {any} $inputContainer 
         * @param {any} type 
         * @returns 
         */
        self.injectCombo = function($inputContainer, type) {
            self.fire('beforeInjectingCombo', [$inputContainer]);
            var $input = $inputContainer.find('div.cfilter-input');
            if (!$input.length) {
                $input = self.injectInput($inputContainer, type);
                var format = function(o) {
                    return o.text;
                };

                $input.off().select2({
                    dropdownAutoWidth: true,
                    width: '100%',
                    data: function() {
                        self.fire('beforeUpdatingComboData', [$input]);
                        var data = self.getPossibilities($input);
                        self.fire('afterUpdatingComboData', [$input, data]);
                        return data;
                    },
                    allowClear: true,
                    placeholder: $input.attr('placeholder'),
                    formatSelection: format,
                    formatResult: format
                });
            }
            self.fire('afterInjectingCombo', [$input]);
            return $input;
        };
        /**
         * 
         * 
         * @param {any} $inputContainer 
         * @param {any} type 
         * @returns 
         */
        self.injectDate = function($inputContainer, type) {
            self.fire('beforeInjectingInput', [$inputContainer]);
            var $input = $inputContainer.find('input.cfilter-input');
            if (!$input.length) {
                var placeholder = $inputContainer.text();
                $inputContainer.text('');
                $input = $('<input class="cfilter-input" type="text" placeholder="' + placeholder + '" data-cfilter-type="' + type + '"></input>');
                $inputContainer.addClass('cfilter-input-container-' + type).append($input);
            }
            self.fire('afterApplyingFilter', [$input]);
            return $input;
        };
        /**
         * 
         * 
         * @param {any} $input 
         * @param {any} inputFilter 
         */
        self.applyEventDate = function($input, inputFilter) {
            self.fire('beforeApplyingEventInput', [$input]);
            $input.off().on('input', function(e) {
                var $target = $(e.target);
                var value = $target.val();
                if (!$target.next('.select2-search-choice-close').length && value) {
                    self.injectDeleteButton($target);
                }
                if ($target.next('.select2-search-choice-close').length && !value) {
                    self.removeDeleteButton($target);
                }
                inputFilter.text = value;
                self.filter();
            });
            inputFilter.accepts = function(data) {
                var value = this.getData(data);
                return self.verifyInput(self.respectsDateFilter, value, data, this.text, this);
            };
            self.fire('afterApplyingEventInput', [$input]);
        };

        /**
         * Inject into an input a little croxx to erase the input
         * 
         * @param {jquery} $input The input jqeury object
         */
        self.injectDeleteButton = function($input) {
            var $close = $('<abbr class="select2-search-choice-close"></abbr>');
            $close.on('click', function(e) {
                var $target = $(e.target);
                var $cfilter = $target.prev('.cfilter-input');
                var $inputContainer = $cfilter.closest('.cfilter-input-container');
                $cfilter.val('');
                self.reinitInput(self.config.inputFilters[$inputContainer.data('cfilter-source-class')]);
                self.filter();
                $target.remove();
            });
            $input.closest('.cfilter-input-container').append($close);
        };
        /**
         * 
         * 
         * @param {any} $input 
         */
        self.removeDeleteButton = function($input) {
            $input.closest('.cfilter-input-container').find('.select2-search-choice-close').remove();
        };
        /**
         * A function that verifies if the value type corresponds to the current field
         * 
         * @param {string} text The text of the field to compare
         * @param {string} textFilter The typed text
         * @returns True if respects or false
         */
        self.respectsNumberFilter = function(text, textFilter) {
            textFilter.replace(/\s/g, "");
            if (text == '') {
                text = 0;
            }
            return ((text == textFilter) || (/^[=|>|<](-)?\d+(.\d+)?$/.test(textFilter) && eval(text.toString().concat(textFilter.replace('=', '===')))));
        };
        /**
         * @see respectsNumberFilter documention
         * 
         * @param {any} text 
         * @param {any} textFilter 
         * @returns 
         */
        self.respectsTextFilter = function(text, textFilter) {
            return text && text.toUpperCase().indexOf(textFilter.toUpperCase()) > -1;
        };
        /**
         * @see respectsNumberFilter documention
         * 
         * @param {any} text 
         * @param {any} textFilter 
         * @returns 
         */
        self.respectsDateFilter = function(text, textFilter) {
            textFilter = textFilter.replace(/\s/g, "");
            if (/^[>|<]?[0-9]{2}\/[0-9]{2}\/[0-9]{4}?$/.test(textFilter)) {
                if (textFilter.charAt(0) === '>') {
                    return moment(text, 'DD/MM/YYYY').isAfter(moment(textFilter.substring(1), 'DD/MM/YYYY'));
                } else if (textFilter.charAt(0) === '<') {
                    return moment(text, 'DD/MM/YYYY').isBefore(moment(textFilter.substring(1), 'DD/MM/YYYY'));
                } else {
                    return text === textFilter;
                }
            }
            return false;
        };
        /**
         * @see respectsNumberFilter documention
         * 
         * @param {any} text 
         * @param {any} textFilter 
         * @returns 
         */
        self.respectsComboFilter = function(text, textFilter) {
            return (text === self.VIDE && textFilter === self.VIDE) || (text && text.toUpperCase().indexOf(textFilter.toUpperCase()) > -1);
        };
        /**
         * Applies the event of the text type input
         * The event is triggered at every letter typing
         * 
         * @param {any} $input The text input where we want to inject the event
         * @param {any} inputFilter 
         */
        self.applyEventInput = function($input, inputFilter) {
            self.fire('beforeApplyingEventInput', [$input]);
            // when type a key we add or remove the cross and filter
            $input.off().on('input', function(e) {
                var $target = $(e.target);
                var value = $target.val();
                if (!$target.next('.select2-search-choice-close').length && value) {
                    self.injectDeleteButton($target);
                }
                if ($target.next('.select2-search-choice-close').length && !value) {
                    self.removeDeleteButton($target);
                }
                inputFilter.text = value;
                self.filter();
            });

            // we add the function "accepts" to the inputFilter to call it when filtering
            /**
             * 
             * @param {*} data the data (task, resource, theo capa etc ..) which contains the field to compare
             */
            inputFilter.accepts = function(data) {
                var value = this.getData(data);
                return self.verifyInput(self.respectsTextFilter, value, data, this.text, this);
            };
            self.fire('afterApplyingEventInput', [$input]);
        };
        /**
         * 
         * 
         */
        self.reinitInputs = function() {
            for (var input in self.config.inputFilters) {
                if ({}.hasOwnProperty.call(self.config.inputFilters, input)) {
                    self.reinitInput(self.config.inputFilters[input]);
                }
            }
        };
        /**
         * 
         * 
         * @param {any} input 
         */
        self.reinitInput = function(input) {
            delete input.text;
        };
        /**
         * 
         * 
         * @param {any} respectsFilterFunction 
         * @param {any} $toFilterInfo 
         * @param {any} data 
         * @param {any} textFilter 
         * @returns 
         */
        self.verifyInput = function(respectsFilterFunction, $toFilterInfo, data, textFilter) {
            return respectsFilterFunction($toFilterInfo, textFilter);
        };
        /**
         * 
         * 
         * @param {any} $input 
         * @param {any} inputFilter 
         */
        self.applyEventNumber = function($input, inputFilter) { // A factoriser
            self.fire('beforeApplyingEventInput', [$input]);
            $input.off().on('input', function(e) {
                var $target = $(e.target);
                var value = $target.val();
                if (!$target.next('.select2-search-choice-close').length && value) {
                    self.injectDeleteButton($target);
                }
                if ($target.next('.select2-search-choice-close').length && !value) {
                    self.removeDeleteButton($target);
                }
                inputFilter.text = value;
                self.filter();
            });
            inputFilter.accepts = function(data) {
                var value = this.getData(data);
                return self.verifyInput(self.respectsNumberFilter, value, data, this.text, this);
            };
            self.fire('afterApplyingEventInput', [$input]);
        };
        /**
         * 
         * 
         * @param {any} $input 
         * @param {any} inputFilter 
         */
        self.applyEventCombo = function($input, inputFilter) { // A factoriser
            self.fire('beforeApplyingEventCombo', [$input]);
            $input.on('select2-selected select2-removed', function() {
                var $el = $(this);
                var data = $el.select2('data');
                var value = data ? data.text : '';
                inputFilter.text = value;
                self.filter();
            });
            inputFilter.accepts = function(data) {
                var value = this.getData(data) || self.VIDE;
                return this.text ? self.verifyInput(self.respectsComboFilter, value, data, this.text, this) : true;
            };
            self.fire('afterApplyingEventCombo', [$input]);
        };
        /**
         * The main function that filters
         * 
         * Calls the "accepts" of all inputFilter we added in the applyEvent functions
         * 
         * @returns 
         */
        self.filter = function() {
            // TODO : Reinit the filter ?
            var $container = self.container;
            if (!$container.hasClass('cfiltered')) {
                return;
            }
            self.fire('beforeFilteringAll');
            var data = self.getData();
            data.forEach(function(el) {
                el.cfilter = {
                    shouldBeVisible: true
                };
                for (var input in self.config.inputFilters) {
                    if ({}.hasOwnProperty.call(self.config.inputFilters, input)) {
                        if (el.cfilter.shouldBeVisible && self.config.inputFilters[input].text) {
                            el.cfilter.shouldBeVisible = el.cfilter.shouldBeVisible && self.config.inputFilters[input].accepts(el);
                            if (!el.cfilter.shouldBeVisible) {
                                break;
                            }
                        }
                    }
                }

            }, self);

            // and we call the render function passed in the configuration
            self.config.renderCallback && self.config.renderCallback.call(self.config.context);
            self.fire('afterFilteringAll');
        };
        /**
         * Gets the text of a filter input
         * 
         * @param {jquery} $cfilter The input 
         * @returns 
         */
        self.getValue = function($cfilter) {
            if ($cfilter.attr('data-cfilter-type') === 'combo') {
                return $cfilter.select2('data') ? $cfilter.select2('data').text : '';
            } else if ($cfilter.attr('data-cfilter-type') === 'text' || $cfilter.attr('data-cfilter-type') === 'number') {
                return $cfilter.val();
            } else if ($cfilter.attr('data-cfilter-type') === 'date') {
                return new Date($cfilter.val());
            }
            return $cfilter.text();
        };
        /**
         * Update the filter
         * 
         * Useful when doing DOM manipulation (like re-rendering)  and we want to re-hide the already filtered lines
         * 
         * @param {any} $container a container that has the class "cfiltered"
         * @returns 
         */
        self.updateFilter = function($container) {
            if ($container.length && !$container.hasClass('cfiltered')) {
                return;
            }
            self.filter($container);
        };
        /**
         * 
         * 
         * @param {any} id 
         * @param {any} observer 
         */
        self.addObserver = function(id, observer) {
            self.observers[id] = observer;
        };
        /**
         * 
         * 
         * @param {any} id 
         */
        self.removeObserver = function(id) {
            delete self.observers[id];
        };

        self.fire = function(message, params) {
            for (var observer in self.observers) {
                if ({}.hasOwnProperty.call(self.observers, observer) && self.observers[observer].update) {
                    self.observers[observer].update(message, params);
                }
            }
        };
        /**
         * 
         * 
         */
        self.applyConfig = function() {
            self.injectDisplayFilterButton();
            self.tryEnablingFilter();
        };
        /**
         * Injects the filter button in the toolbar of a table
         * 
         * Injects it in the div which has a cfilter-button-container class
         * 
         * @returns 
         */
        self.injectDisplayFilterButton = function() {
            if (!self.config.displayFilterButton) {
                return;
            }
            var buttonContainer = self.container.find('.cfilter-button-container');
            if (!buttonContainer.length || buttonContainer.find('.toggle_filters').length) {
                return;
            }

            var button = $('<button type="button" class="btn btn-default btn-xs toggle_filters"><span class="fa fa-filter" data-toggle="tooltip" title="' + self.config.context.$messages.filter + '"></span></button>');
            buttonContainer.append(button);
            button.off().on('click', function() {
                self.fire('filterButtonClicked');
                var $list = self.container;
                var id = $list.attr('id');
                if ($list.hasClass('cfiltered')) {
                    self.disableFilter();
                    self.removeObserver(id);
                } else {
                    self.addObserver(id, self.config.context);
                    self.enableFilter();
                }
            });
        };
        /**
         * 
         * 
         * @returns 
         */
        self.tryEnablingFilter = function() {
            if (!self.config.displayAtLoad) {
                return;
            }
            self.enableFilter();
        };
        /**
         * Gets the list of object we want to iterate on
         * 
         * used in filter()
         * 
         * @returns An array
         */
        self.getData = function() {
            return self.config.data;
        };

        self.applyConfig();
    }
    return CFilter;
});