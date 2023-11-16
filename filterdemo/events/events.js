"use strict";

function EventsDemo() {

    this.data = [
        { "id": "x7", "name": "Yoko", "tagList": ["c", "b", "j_a"], "start": "1983.06.12", "end": "1995.01.24" },
        { "id": "x1", "name": "Alpha", "tagList": ["a", "b", "sup_a"], "start": "1960.05.10", "end": "1989.xx.xx" },
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
                   "periodFilter": {
                        "fieldStart": "start",
                        "fieldEnd": "end",
                   }
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
        this.filterApp.init();
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