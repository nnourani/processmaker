<template>
    <div>
        <SearchPopover
            target="popover-target-1"
            @savePopover="onOk"
            :title="addSearchTitle"
        >
            <template v-slot:body>
                <b-form-group>
                    <b-form-radio-group
                        v-model="selectedRadio"
                        :options="getFilterColletion('radio')"
                        value-field="id"
                        text-field="optionLabel"
                        name="flavour-2a"
                        stacked
                    ></b-form-radio-group>
                    <b-form-group> </b-form-group>
                    <b-form-checkbox-group
                        id="checkbox-1"
                        v-model="selectedCheckbox"
                        :options="getFilterColletion('checkbox')"
                        value-field="id"
                        text-field="optionLabel"
                        name="checkbox-1"
                    >
                    </b-form-checkbox-group>
                </b-form-group>
            </template>
        </SearchPopover>

        <div class="p-1 v-flex">
            <h5 class="v-search-title">{{ title }}</h5>
            <div class="pm-in-text-icon">
                <i :class="icon"></i>
            </div>
            <b-input-group class="w-75 p-1">
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span
                            class="input-group-text bg-primary-pm text-white"
                            id="popover-target-1"
                            @click="searchClickHandler"
                        >
                            <b-icon icon="search"></b-icon
                        ></span>
                    </div>
                    <b-form-tags input-id="tags-pills" v-model="searchTags">
                        <template v-slot="{ tags, tagVariant, removeTag }">
                            <div class="d-inline-block" style="font-size: 1rem">
                                <b-form-tag
                                    v-for="tag in tags"
                                    @remove="customRemove(removeTag, tag)"
                                    :key="tag"
                                    :title="tag"
                                    :variant="tagVariant"
                                    class="mr-1 badge badge-light"
                                >
                                    <div :id="tag">
                                        <i class="fas fa-tags"></i>
                                        {{ tagContent(tag) }}
                                    </div>
                                    <component
                                        v-bind:is="tagComponent(tag)"
                                        v-bind:info="tagInfo(tag)"
                                        v-bind:tag="tag"
                                        v-bind:filter="dataToFilter(tag)"
                                        @updateSearchTag="updateSearchTag"
                                    />
                                </b-form-tag>
                            </div>
                        </template>
                    </b-form-tags>
                </div>
            </b-input-group>
        </div>
    </div>
</template>

<script>
import SearchPopover from "./popovers/SearchPopover.vue";
import CaseNumber from "./popovers/CaseNumber.vue";
import CaseTitle from "./popovers/CaseTitle.vue";
import ProcessName from "./popovers/ProcessName.vue";
import DateFilter from "./popovers/DateFilter.vue";
import TaskTitle from "./popovers/TaskTitle.vue";
import CurrentUser from "./popovers/CurrentUser.vue";
import VARCHAR from "./popovers/String.vue";
import DATETIME from "./popovers/DateTime.vue";
import api from "./../../api/index";

export default {
    name: "CustomFilter",
    props: ["filters", "title", "icon", "hiddenItems", "filterItems"],
    components: {
        SearchPopover,
        CaseNumber,
        CaseTitle,
        ProcessName,
        DateFilter,
        TaskTitle,
        CurrentUser,
        VARCHAR,
        DATETIME
    },
    data() {
        return {
            searchLabel: this.$i18n.t("ID_SEARCH"),
            addSearchTitle: this.$i18n.t("ID_ADD_SEARCH_FILTER_CRITERIA"),
            searchTags: [],
            dataLoaded: false, 
            selectedRadio: "",
            selectedCheckbox: [],
            itemModel: {},
            byProcessName: "",
            criteriaItemsRadio: [],
            criteriaItemsCheckbox: [],
            showProcessName: true,
        };
    },
    watch: {
        filters: {
            immediate: true,
            handler(newVal, oldVal) {
              this.searchClickHandler();
                this.searchTags = [];
                this.selectedRadio = "";
                //Prevent show popover at the first time
                if (newVal.length) {
                    this.setFilters(newVal, oldVal);
                    this.searchClickHandler();
                }
            },
        },
    },
    methods: {
        /**
         * Get filter as a collection
         * @param {string}
         * @returns {object}
         */
        getFilterColletion(type) {
            let found,
                criteria = [],
                filterCollection = this.filterItems.filter(
                    (item) => item.group === type
                );
            if (this.hiddenItems && this.hiddenItems.length) {
                filterCollection.forEach((item) => {
                    found = this.hiddenItems.find((elem) => elem !== item.id);
                    if (found) {
                        criteria.push(item);
                    }
                });
                return criteria;
            } else {
                return filterCollection;
            }
        },
        /**
         * Add filter criteria save button handler
         */
        onOk() {
            let self = this,
                element,
                initialFilters = [],
                item;
            this.$root.$emit("bv::hide::popover");
            element = _.find(this.filterItems, function(o) {
                return o.id === self.selectedRadio;
            });
            if (element) {
                this.showProcessName = false;
                initialFilters = this.prepareFilterItems(
                    element,
                    this.selectedRadio,
                    true
                );
            } else {
                this.showProcessName = true;
            }
            self.selectedCheckbox.forEach((item) => {
                element = _.find(this.filterItems, function(o) {
                    return o.id === item;
                });
                if (element) {
                    element.autoShow = self.showProcessName;
                    initialFilters =[...new Set([...initialFilters,...this.prepareFilterItems(element, item, true)])];
                }
            });
            this.$emit("onUpdateFilters", {
                params: initialFilters,
                refresh: false,
            });
        },
        /**
         * Prepare the filter items
         * @param {array} items
         * @param {id} string
         * @param {boolean} restore
         */
        prepareFilterItems(element, id, restore) {
            let initialFilters = [],
                self = this,
                filter,
                item;
            _.forEach(element.items, function(value, key) {
                filter = _.find(self.filters, function(o) {
                    return o.filterVar === value.id;
                });
                if (filter && restore) {
                    initialFilters.push(filter);
                } else {
                    item = {
                        filterVar: value.id,
                        type: element.type,
                        fieldId: id,
                        value: "",
                        label: "",
                        options: [],
                        autoShow: element.autoShow,
                    };
                    initialFilters.push(item);
                }
            });
            return initialFilters;
        },
        /**
         * Set Filters and make the tag labels
         * @param {object} filters json to manage the query
         */
        setFilters(filters, oldVal) {
            let self = this;
            _.forEach(filters, function(item, key) {
                let component = _.find(self.filterItems, function(
                    o
                ) {
                    return o.id === item.fieldId;
                });
                if (component) {
                    self.searchTags.push(component.id);
                    self.selectedRadio = component.id;
                    self.itemModel[component.id] = component;
                    self.itemModel[component.id].autoShow =
                        typeof item.autoShow !== "undefined"
                            ? item.autoShow
                            : true;
                }
            });
        },
        /**
         * Prepare data filter
         * @param {string} id
         * @returns {object}
         */
        dataToFilter(id) {
            let data = [];
            _.forEach(this.filters, function(item) {
                if (item.fieldId === id) {
                    data.push(item);
                }
            });
            return data;
        },
        /**
          * Prepare tag content
          * @param {string} id
          * @returns {string}
         */
        tagContent(id) {
            if (
                this.itemModel[id] &&
                typeof this.itemModel[id].makeTagText === "function"
            ) {
                return this.itemModel[id].makeTagText(
                    this.itemModel[id],
                    this.dataToFilter(id)
                );
            }
            return "";
        },
        /**
         * Prepare tag component
         * @param {string} id
         * @returns {string|null}
         */
        tagComponent(id) {
            if (this.itemModel[id]) {
                return this.itemModel[id].type;
            }
            return null;
        },
        /**
         * Prepare the tag info
         * @param {string} id
         * @returns {string|null}
         */
        tagInfo(id) {
            if (this.itemModel[id]) {
                return this.itemModel[id];
            }
            return null;
        },
        /**
         * Remove from tag button
         * @param {function} removeTag - default callback
         * @param {string} tag filter identifier
         */
        customRemove(removeTag, tag) {
            let temp = [];
            _.forEach(this.filters, function(item, key) {
                if (item.fieldId !== tag) {
                    temp.push(item);
                }
            });
            if (tag === "processName") {
                this.byProcessName = "";
                this.selectedCheckbox = [];
            }
            this.$emit("onUpdateFilters", { params: temp, refresh: true });
        },
        /**
         * Update the filter model this is fired from filter popaver save action
         * @param {object} params - arrives the settings
         * @param {string} tag filter identifier
         */
        updateSearchTag(params) {
            let temp = this.filters.concat(params);
            temp = [...new Set([...this.filters, ...params])];
            this.$emit("onUpdateFilters", { params: temp, refresh: true });
        },
        /**
         * Seach click event handler
         */
        searchClickHandler() {
            this.$root.$emit("bv::hide::popover");
        },
    },
};
</script>
<style scoped>
.bv-example-row .row + .row {
    margin-top: 1rem;
}

.bv-example-row-flex-cols .row {
    min-height: 10rem;
}

.bg-primary-pm {
    background-color: #0099dd;
}

.v-flex {
    display: flex;
}

.v-search-title {
    padding-right: 10px;
    line-height: 40px;
}
.pm-in-text-icon {
    font-size: 2vw;
    padding-right: 10px;
    line-height: 3vw;
}
</style>
