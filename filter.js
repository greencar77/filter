"use strict";

function FilterCore(entries, config) {
    this.panelTagName = "filterdemo-panel";

    this.entries = entries;
    this.config = config;
    this.filters = config.filters? new Map(config.filters.map(e => [e.id, e])) : null;
    this.ignorableTags = config.ignorableTags;
    this.tagPropName = config.tagPropName;
    this.entryCreator = config.entryCreator;
    if (!config.appName) {
        alert('Missing appName');
        return;
    }
    this.appName = config.appName;
    if (!config.filterPropertyName) {
        alert('Missing filterPropertyName');
        return;
    }
    this.filterPropertyName = config.filterPropertyName;
    this.context = new Map();
    console.log("entries.length=" + entries.length);

    this.init = function() {
        console.log("populatePanels");

        let filterNodes = document.getElementsByTagName(this.panelTagName);
        console.log("panel count: " + filterNodes.length);

        for (const filterNode of filterNodes) {
            this.populatePanel(filterNode);
        }
    }

    this.populatePanel = function(panel) {
        console.log("populatePanel id=" + panel.id);

        let filteredEntries;
        if (this.filters && this.filters.has(panel.id)) {
            let filterFn = this.filters.get(panel.id).filter;
            if (this.filters.get(panel.id).filterMethod) {
                filterFn = this[this.filters.get(panel.id).filterMethod];
            }
            filteredEntries = this.entries.filter(filterFn);
            console.log('Filtered ' + filteredEntries.length);
        } else {
            filteredEntries = this.entries;
            console.log('Complete (non-filtered) set ' + filteredEntries.length);
        }

        let context = new Map();
        context.panelId = panel.id;
        context.appliedFilters = [];
        context.remainingTagMap = this.createTagMap(filteredEntries, this.ignorableTags);
        context.entries = filteredEntries;
        this.context.set(panel.id, context);

        panel.appendChild(this.createFilterPane(context));
        panel.appendChild(this.createCollectionPane(filteredEntries, this.entryCreator, context.appliedFilters));
    }

    this.createFilterPane = function(context) {
        let result = document.createElement('span');
        result.setAttribute('class', 'filterPane');
        this.refreshFilterPane(result, context);
        return result;
    }

    this.refreshFilterPane = function(filterPane, context) {
        filterPane.innerHTML = '';
        this.forcedlyPickCompleteTags(context);
        this.appendAppliedFilters(filterPane, context);
        this.appendNonAppliedFilters(filterPane, context);
    }

    this.createCollectionPane = function(entries, entryFn, skippingTags) {
        if (!entryFn) {
            return;
        }

        let result = document.createElement('div');
        let ol = document.createElement('ol');
        this.refreshCollectionPane(ol, entries, entryFn, skippingTags);
        result.appendChild(ol);
        return result;
    }

    this.refreshCollectionPane = function(parent, entries, entryFn, skippingTags) {
        parent.innerHTML = '';
        let sortedEntries = entries;
        if (this.config.itemsComparator) {
            sortedEntries = entries.sort(this.config.itemsComparator);
        }
        for (const entry of sortedEntries) {
            parent.appendChild(entryFn(entry, skippingTags));
        }
    }

    this.createTagMap = function(items, ignorableTags) {
        const result = new Map();
        items.forEach(i => {
            if (i[this.tagPropName]) {
                let itemTags = [];
                i[this.tagPropName].forEach(t => {
                    if (!ignorableTags || !ignorableTags.includes(t)) {
                        if (itemTags.includes(t)) {
                            console.log(i);
                            console.log('Duplicating tags: ' + t);
                        } else {
                            if (!result.has(t)) {
                                result.set(t, 0);
                            }
                            result.set(t, result.get(t) + 1);
                            itemTags.push(t);
                        }
                    }
                });
            }
        });
        return result;
    }

    this.applyFilter = function(elem, filterName) {
        let root = elem.parentElement.parentElement;
        this.applyFilterByPanel(root, filterName);
    }

    this.applyFilterByPanelId = function(panelId, filterName) {
        let panel = document.getElementById(panelId);
        this.applyFilterByPanel(panel, filterName);
    }

    this.applyFilterByPanel = function(panelElem, filterName) {
        let filterId = panelElem.id;
        console.log('applyFilter ' + filterId + ' ' + filterName);

        let context = this.context.get(filterId);
        context.appliedFilters.push(filterName);

        context.entries = context.entries
            .filter(e => e[this.tagPropName] && e[this.tagPropName].includes(filterName));
        context.remainingTagMap = this.createTagMap(context.entries, this.ignorableTags);

        this.refreshFilterPane(panelElem.children[0], context);
        this.refreshCollectionPane(panelElem.children[1].children[0], context.entries, this.entryCreator, context.appliedFilters);
    }

    this.forcedlyPickCompleteTags = function(context) {
        let fullCount = context.entries.length;
        for (let [key, tagEntriesCount] of context.remainingTagMap.entries()) {
            if (!context.appliedFilters.includes(key) && tagEntriesCount == fullCount) {
                context.remainingTagMap.delete(key); //sic! altering collection which is being iterated
                context.appliedFilters.push(key);
            }
        }
    }

    this.appendAppliedFilters = function(filterPane, context) {
        context.appliedFilters.forEach(f => {
            filterPane.appendChild(document.createTextNode(' '));
            let elem = document.createElement('span');
            elem.setAttribute('class', 'pickedTag');
            elem.textContent = f;
            filterPane.appendChild(elem);
        });

        filterPane.appendChild(document.createTextNode(' '));
        filterPane.appendChild(document.createTextNode(context.entries.length));
    }

    this.appendNonAppliedFilters = function(filterPane, context) {
        let keysSorted = Array.from(context.remainingTagMap.keys()).sort();
        let remainingTags = keysSorted.filter(k => !context.appliedFilters.includes(k));
        if (this.config.tagGroups) {
            for (const group of this.config.tagGroups) {
                remainingTags = this.appendCombo(filterPane, context, remainingTags, group);
            }
        }
        for (const key of remainingTags) {
            this.appendTagElem(filterPane, key, context.remainingTagMap.get(key));
        }
    }

    this.appendTagElem = function(parent, tagName, count) {
        parent.appendChild(document.createTextNode(' '));
        let linkElem = document.createElement('span');
        linkElem.setAttribute('class', 'pickableTag');
        linkElem.textContent = tagName + '=' + count;
        linkElem.setAttribute('onclick', this.appName + "." + this.filterPropertyName + ".applyFilter(this,'" + tagName + "');");
        parent.appendChild(linkElem);
    }

    this.appendCombo = function(parent, context, remainingTags, group) {
        let groupKeys;
        if (group.byPrefix) {
            groupKeys = remainingTags.filter(k => k.startsWith(group.byPrefix));
        } else if (group.byValues) {
            groupKeys = remainingTags.filter(k => group.byValues.includes(k));
        } else {
            alert('Unknown group: ' + group)
        }
        if (groupKeys.length == 0) {
            return remainingTags;
        }
        //subtract
        let updatedRemainingTags = remainingTags.filter(t => !groupKeys.includes(t));
        let combo = document.createElement('select');
        combo.setAttribute('id', 'sel_' + context.panelId + '_' + 'pref_' + (group.id? group.id: group.byPrefix));
        combo.setAttribute('class', 'tagCombo');
        combo.setAttribute('onchange', this.appName + '.filterApp.pickComboTag(this);');
        let option = document.createElement('option');
        option.textContent = group.title? group.title : group.byPrefix;
        combo.appendChild(option);
        groupKeys.forEach(k => {
            option = document.createElement('option');
            option.value = k;
            option.textContent = (group.byPrefix? k.substring(group.byPrefix.length) : k) + ' ' + '(' + context.remainingTagMap.get(k) + ')';
            combo.appendChild(option);
        });
        parent.appendChild(combo);
        return updatedRemainingTags;
    }

    this.pickComboTag = function(selectElement) {
        let combo = document.getElementById(selectElement.id);
        //console.log(selectElement.id + ' ' + combo.options[combo.selectedIndex].value);
        if (combo.selectedIndex > 0) {
            this.applyFilter(selectElement, combo.options[combo.selectedIndex].value);
        }
    }

    this.urlFilter = function(x) {
        let params = window.location.hash.substring(1);
        if (params) {
            let filterTags = params.split(',');
            if (!x.tagList) { //"tagList" may not work! itš custom
                return false;
            }
            return filterTags.reduce((accumulator, tag) => accumulator && x.tagList.includes(tag), true);
        }
        return false;
    }
}