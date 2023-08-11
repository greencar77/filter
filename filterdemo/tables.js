"use strict";

const app = new FilterDemo();

function FilterDemo() {

    this.data = [
        { "id": "x7", "name": "Yoko", "tagList": ["c", "b", "j_a"] },
        { "id": "x1", "name": "Alpha", "tagList": ["a", "b", "sup_a"] },
        { "id": "x2", "name": "Beta", "tagList": ["b", "c", "d", "sup_b", "j_a"] },
        { "id": "x3", "name": "Gamma", "tagList": ["a", "b", "c", "sup_a"] },
        { "id": "x4", "name": "Gamma", "tagList": [] },
        { "id": "x5", "name": "Gamma", "tagList": ["tum", "j_b"] },
        { "id": "x6", "name": "duplicate tags", "tagList": ["small", "small", "b", "j_b", "j_a"] },
        { "id": "x7", "name": "duplicate tags", "tagList": ["small", "alpha", "beta"] },
        { "id": "x8", "name": "duplicate tags", "tagList": ["beta", "gamma"] },
    ];

    this.urlFilterDemo = function(x) {
        let params = window.location.hash.substring(1);
        if (params) {
            if (!x.tagList) {
                return false;
            }
            let filterTags = params.split(',');
            return filterTags.reduce((accumulator, tag) => accumulator && x.tagList.includes(tag), true);
        }
        return true;
    }

    this.filterConfig =  {
            "tagPropName": "tagList",
            "filters": [
                {
                   "id": "f1",
                   "random": true,
                },
            ],
            "entryCreator": (entry, skippingTags) => this.entryCreator(entry, skippingTags),
            "appName": "app",
            "filterPropertyName": "filterApp",
            "itemsComparator": (a, b) => {
                if (a.id && b.id) {
                    if (a.id == b.id) {
                        return 0;
                    }
                    if (a.id > b.id) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
                return 0;
            },
            "tagGroups": [
                {
                    "byPrefix": "dccint_",
                },
                {
                    "byPrefix": "sup_",
                },
                {
                    "id": "g2",
                    "byValues": [ "alpha", "beta", "gamma" ],
                    "title": "some title",
                },
            ],
            "containerFn": () => this.createContainerTable,
        };

    this.filterApp = new FilterCore(this.data, this.filterConfig);

    this.init = function() {
        let groups = [
                         {
                             "id": "g1",
                             "prefix": "sup_"
                         },
                     ];

        this.filterApp.init();
    }

    this.entryCreator = function(entry, skippingTags) {
        let result = document.createElement('tr');
        let td;

        td = document.createElement('td');
        td.setAttribute('class', 'filter');
        td.textContent = entry.id;
        result.appendChild(td);

        td = document.createElement('td');
        td.setAttribute('class', 'filter');
        let showableTags = entry.tagList.filter(t => !skippingTags.includes(t));
        td.textContent = showableTags;
        result.appendChild(td);

        td = document.createElement('td');
        td.setAttribute('class', 'filter');
        td.textContent = entry.name;
        result.appendChild(td);

        return result;
    }

    this.createContainerTable = function() {
        let outerElement = document.createElement('div');
        let innerElement = document.createElement('table');
        innerElement.setAttribute('class', 'filter');
        outerElement.appendChild(innerElement);
        return { "outer": outerElement, "inner": innerElement };
    }
}