/**
 * This class is a configuration passer when initializing a CFilter or TaskFilter
 * 
 */
define(function() {

    function CFilterConfig() {
        // Config for tables
        var self = this;
        /**
         * True if the button that enables filters should be displayed
         */
        self.displayFilterButton = false;
        /**
         * True if the filter should be enabled at the page load
         */
        self.displayAtLoad = false;
        /**
         * The function to call after filtering to render filtered elements
         */
        self.renderCallback = null;
        /**
         * @type {{array}}
         * The data to browse when filtering. (tasks, resources, etc ...)
         */
        self.data = null;
        /**
         * the context that creates the filter (current of planning, absence, mapping, etc ...)
         */
        self.context = null;
        /**
         * The filters that will be added at the initialisation
         */
        self.inputFilters = {};

        /**
         * Adds a filter
         * 
         * @param {string} id The name of the value contained in the data-cfilter-source-class of an input container. Allows to associate this filter to the html column.
         * @param {function} getData The function which will get the correct value of a cell in the filtered column
         * 
         * Example : In the theo capa table we have a column "resume-lastname".
         * So we put an attribute data-cfilter-source-class="cfilter-resource-lastname" (or anything that evoques a lastname) on the column "resume-lastname" in the div which has the class "cfilter-input-container".
         * Then we create the function that will get the lastname of a resource in this class (or anywhere else it's just to find every thing here).
         * 
         * @returns this
         */
        self.addFilter = function(id, getData) {
            self.inputFilters[id] = {
                getData: getData,
                accepts: undefined
            };
            return self;
        };

        self.setData = function(data) {
            self.data = data;
            return self;
        };

        self.setContext = function(context) {
            self.context = context;
            return self;
        };

        self.setRenderCallback = function(callback) {
            self.renderCallback = callback;
            return self;
        };

        self.setDisplayAtLoad = function(displayAtLoad) {
            self.displayAtLoad = displayAtLoad;
            return this;
        };

        self.setDisplayFilterButton = function(displayFilterButton) {
            self.displayFilterButton = displayFilterButton;
            return this;
        };
    }

    // Gets the name of a resource
    CFilterConfig.getName = function(data) {
        return data && data.name;
    };

    return CFilterConfig;
});