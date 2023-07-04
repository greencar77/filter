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
                   "filter": function(x) {
                       return x.tagList && x.tagList.includes('a');
                   },
                },
                {
                   "id": "f5",
                   "filter": function(x) {
                       return x.tagList && x.tagList.includes('a');
                   },
                   "random": true,
                },
                {
                   "id": "f4",
                   "filter": this.urlFilterDemo,
                },
                {
                   "id": "f5",
                   "filter": this.urlFilterDemo,
                   "random": true,
                },
            ],
            "ignorableTags": ["d"],
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

        this.filterApp.applyFilterByPanelId('f2', 'b');
    }

    this.entryCreator = function(entry, skippingTags) {
        let result = document.createElement('li');
        result.textContent = this.createShortSummary(entry, skippingTags);
        return result;
    }

    this.createShortSummary = function(entry, skippingTags) {
        let showableTags = entry.tagList.filter(t => !skippingTags.includes(t));
        return entry.id
            + ' [' + showableTags + ']'
            + ' ' + entry.name
            ;
    }
}