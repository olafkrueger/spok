// 'filters' needs to be an array of filter items which must follow this pattern:
//
// filters: [
//   {
//     field: "myField",
//     title: "My Title",
//     selectedItems: [],
//     selectedItem: "",
//     initialItems: [
//       { value: "myValue", count: -1 },
//     ],
//     reactive: true,
//     exclude: [],
//     items: [],
//     multiple: false,
//     visible: false,
//     sort: false,
//   },
// ];

/**
 * Apply passed filters on passed data set
 *
 * @param {Object[]} data - The data set which has to be filtered. Needs to be flattened!
 * @param {Object[]} filters - The filters which has to be applied on the passed data set
 * @returns {Object[]} - The filtered result set
 */
const applyFilters = function (data, filters) {
  let check = true;
  let check1 = true;
  let check2 = false;
  let myFields = fields(filters);
  let mySelectedValues = [];

  let selectedValuesMap = new Map();
  let hasSelections = false;
  let _selectedValues;
  
  filters.forEach((filter) => {
    _selectedValues = selectedValues(filter);
    selectedValuesMap.set(filter.field, _selectedValues);
    if (_selectedValues.length > 0) {
      hasSelections = true;
    }
  });

  return hasSelections==false?data:data.filter(function (item) {
    check = true;
    check1 = true;
    check2 = true; // In case of an array we need to invert the logic because we need to check for an array additionally

    myFields.forEach((field) => {
      mySelectedValues = selectedValuesMap.get(field);
      
      if (
        mySelectedValues.length > 0 &&
        !Array.isArray(item[field]) &&
        mySelectedValues.includes(item[field]) == false
      ) {
        check1 = false;
        //console.log("Match1!")
      }
      
      if (
        mySelectedValues.length > 0 &&
        Array.isArray(item[field]) &&
        findCommonElements(mySelectedValues, item[field]) == false
      ) {
        check2 = false;
        //console.log("Match2")
      }
      // All filters must match, otherwise the item has to be removed!
      if (check1 == false || check2 == false) {
        //console.log("Match!")
        check = false;
      }
    });
    return check;
  });
};

/**
 * Init filters
 *
 * @param {Object[]} data - The data set. Needs to be flattened!
 * @param {Object[]} filters - The filters which has to be applied on the passed data set
 * @returns {Object[]} - The initialized filters
 */
const initFilters = function (data, filters) {
  filters.forEach((filter) => {
    filter.items = aggregate(data, filter.field, initialValues(filter));
    if (filter.initialItems.length == 0) {
      filter.initialItems = filter.items;
    }
  });
  sortFilters(filters);
  return filters;
};

/**
 * Update filter items, needed e.g. when filter selection has been changed
 *
 * @param {Object[]} data - The data set which has to be filtered. Needs to be flattened!
 * @param {Object[]} filters - The filters which has to be applied on the passed data set
 * @param {string} field - The field name of the filter which has been triggered this action
 * @param {Boolean} sort - true if the filter items has to be sorted. The sort follows internal rules.
 * @returns {Object[]} - The updated filters
 */
const updateFilters = function (data, filters, field, sort = true) {
  // Update filters:
  // - Loop through all available filters, except the passed one and those which has to be excluded by definition (Prop exclude)
  // -- Filter the origin data set by applying all selected filters, except the current filter itself
  // -- Create the aggregation for each particular filter by passing the particular filtered result set
  filters
    .filter((item) => item.field != field)
    .filter((item) => !item.exclude.includes(field))
    .forEach((filter) => {
      filters.filter((item) => item.field == filter.field)[0].items = aggregate(
        applyFilters(
          data,
          filters.filter((item) => item.field != filter.field)
        ),
        filter.field,
        initialValues(filter)
      );
    });

  if (sort === true) {
    sortFilters(filters);
  }
  // Return the passed but modified filters!
  return filters;
};

/**
 * Sort filter items by following order:
 * - 1. Selected items
 * - 2. Items which are included within the current result set
 * - 3. The rest ("0 values", items which are not included within the current result set)
 *
 * @param {Object[]} filters - The filters
 * @return {Object[]} - The sorted filters
 */
const sortFilters = function (filters) {
  filters.forEach((filter) => {
    if (filter.sort == true) {
      // Sort filter items by order as described above
      filter.items.sort((a) => {
        if (filter.selectedItems.includes(a.value)) return -1;
        if (!filter.selectedItems.includes(a.value)) return 1;
        return 0;
      });

      filter.items.sort((a, b) => {
        if (
          !filter.selectedItems.includes(a.value) &&
          !filter.selectedItems.includes(b.value) &&
          a.count > b.count
        )
          return -1;
        if (
          !filter.selectedItems.includes(a.value) &&
          !filter.selectedItems.includes(b.value) &&
          a.count < b.count
        )
          return 1;
        return 0;
      });
    }
  });

  // Return the passed but modified filters!
  return filters;
};

/**
 * Aggregate values for passed field and count its occurencies
 *
 * @param {Object[]} data - The data set which has to be filtered. Needs to be flattened!
 * @param {string} field - The field name of the filter which has been triggered this action
 * @param {string[]} initialValues - The values of the filter items which has to be always present. Respects the passed order of values.
 * @returns {Object[]} - The aggregated values including the count, e.g. [{value: "Foo", count: 2}]
 */
const aggregate = function (data, field, initialValues = null) {
  let count;
  let key;
  let aggregationMap = new Map();

  for (let i = 0; i < data.length; i++) {
    // Ensure that 'field' is string or number (We don't check it here)
    key = data[i][field];
    if (Array.isArray(key)) {
      key.forEach(value => {
        if (!aggregationMap.has(value)) {
          aggregationMap.set(value, 1);
        } else {
          count = aggregationMap.get(value);
          count++;
          aggregationMap.set(value, count);
        }
      });
    } else {
      if (!aggregationMap.has(key)) {
        aggregationMap.set(key, 1);
      } else {
        count = aggregationMap.get(key);
        count++;
        aggregationMap.set(key, count);
      }
    }
  }

  // Keep the initial values AND sort the current items accorting to it
  if (
    initialValues != null &&
    Array.isArray(initialValues) &&
    initialValues.length > 0
  ) {
    let count = 0;
    // Re-Create Map in order to sort it according to the given initialFilterValues
    let orderedAggregationMap = new Map();

    initialValues.forEach((value) => {
      count = !aggregationMap.has(value) ? 0 : aggregationMap.get(value);
      orderedAggregationMap.set(value, count);
    });

    aggregationMap = orderedAggregationMap;
  }
  //aggregationMap.forEach(logMapElements);
  return convertMapToArray(aggregationMap);
};

/**
 * Extract the filter field names for all filters
 *
 * @param {Object[]} filters - The filter objects
 * @returns {string[]} - Array of field names of all filters
 */
const fields = (filters) => filters.map((item) => item.field);

/**
 * Extract the initial values for the passed filter
 *
 * @param {Object} filter - The filter
 * @returns {string[]} - Array of intitial values for passed filter
 */
const initialValues = (filter) => filter.initialItems.map((item) => item.value);

/**
 * Extract the selected values for the passed filter
 *
 * @param {Object} filter - The filter
 * @returns {string[]} - Array of selected values for passed filter
 * @returns
 */
const selectedValues = function (filter) {
  let values = [];

  if (filter.multiple == true) {
    if (filter.selectedItems.length > 0) {
      values = filter.selectedItems;
    }
  } else {
    if (filter.selectedItem != "" && filter.selectedItem != undefined) {
      values = [filter.selectedItem];
    }
  }
  return values;
};

/**
 * Convert the aggregation Map to an array of objects
 *
 * @param {Map} map - The result of the aggregation as JS Map
 * @returns {Objects[]} - The the result of the aggregation as array of objects, e.g. [{ value: "foo", count: 23 }]
 */
const convertMapToArray = function (map) {
  let arr = [];
  for (const [key, value] of map) {
    arr.push({ value: key, count: value });
  }
  return arr;
};

// Iterate through each element in the
// first array and if some of them
// include the elements in the second
// array then return true.
const findCommonElements = function (arr1, arr2) {
  return arr1.some(item => arr2.includes(item));
};

// Dev utils
// eslint-disable-next-line 
const logMapElements = function logMapElements(value, key, map) {
  // Just needed during development
  /* eslint-disable-next-line no-console */
  console.log(`m[${key}] = ${value}`);
};



module.exports = {
  applyFilters,
  initFilters,
  updateFilters,
  sortFilters,
  fields,
  initialValues,
  selectedValues,
  aggregate,
};
