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
                v-model="selected"
                :options="criteriaItems"
                value-field="id"
                text-field="optionLabel"
                name="flavour-2a"
                stacked
            ></b-form-radio-group>
        <b-form-group>
        </b-form-group>
            <b-form-checkbox
                id="checkbox-1"
                v-model="byProcessName"
                name="checkbox-1"
                value="processName"
            >
                {{$t('ID_BY_PROCESS_NAME') }}
            </b-form-checkbox>
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
import api from "./../../api/index";

export default {
  name: "Cases",
  props: ["filters", "title", "icon" , "hiddenItems"],
  components: {
    SearchPopover,
    CaseNumber,
    CaseTitle,
    ProcessName,
    DateFilter,
    TaskTitle,
    CurrentUser
  },
  data() {
    return {
        searchLabel: this.$i18n.t("ID_SEARCH"),
        addSearchTitle: this.$i18n.t("ID_ADD_SEARCH_FILTER_CRITERIA"),
        searchTags: [],
        dataLoaded: false,
        filterItems: [
            {
                type: "CaseNumber",
                id: "caseNumber",
                title: `${this.$i18n.t("ID_FILTER")}: ${this.$i18n.t(
                    "ID_BY_CASE_NUMBER"
                )}`,
                optionLabel: this.$i18n.t("ID_BY_CASE_NUMBER"),
                detail: this.$i18n.t("ID_PLEASE_SET_THE_CASE_NUMBER_TO_BE_SEARCHED"),
                tagText: "",
                tagPrefix: this.$i18n.t("ID_SEARCH_BY_CASE_NUMBER"),
                items: [
                    {
                        id: "filterCases",
                        value: "",
                    },
                ],
                autoShow: true,
                makeTagText: function (params, data) {
                    return `${params.tagPrefix}: ${data[0].value}`;
                },
            },
            {
                type: "CaseTitle",
                id: "caseTitle",
                title: `${this.$i18n.t("ID_FILTER")}: ${this.$i18n.t(
                    "ID_BY_CASE_THREAD_TITLE"
                )}`,
                optionLabel: this.$i18n.t("ID_BY_CASE_THREAD_TITLE"),
                tagPrefix: this.$i18n.t("ID_SEARCH_BY_CASE_THREAD_TITLE"),
                detail: "",
                tagText: "",
                items: [
                    {
                        id: "caseTitle",
                        value: "",
                    },
                ],
                autoShow: true,
                makeTagText: function (params, data) {
                    return `${this.tagPrefix} ${data[0].value}`;
                },
            },
            {
                type: "DateFilter",
                id: "delegationDate",
                title: `${this.$i18n.t('ID_FILTER')}: ${this.$i18n.t('ID_BY_DELEGATION_DATE')}`,
                optionLabel: this.$i18n.t('ID_BY_DELEGATION_DATE'),
                detail: this.$i18n.t('ID_PLEASE_SELECT_THE_DELEGATION_DATE_TO_BE_SEARCHED'),
                tagText: "",
                tagPrefix:  this.$i18n.t('ID_SEARCH_BY_DELEGATION_DATE'),
                items:[
                    {
                        id: "delegateFrom",
                        value: "",
                        label: this.$i18n.t('ID_FROM_DELEGATION_DATE')
                    },
                    {
                        id: "delegateTo",
                        value: "",
                        label: this.$i18n.t('ID_TO_DELEGATION_DATE')
                    }
                ],
                makeTagText: function (params, data) {
                    return  `${params.tagPrefix} ${data[0].value} - ${data[1].value}`;
                }
            },
            {
                type: "CurrentUser",
                id: "bySendBy",
                title: `${this.$i18n.t('ID_FILTER')}: ${this.$i18n.t('ID_BY_SEND_BY')}`,
                optionLabel: this.$i18n.t('ID_BY_SEND_BY'),
                detail: this.$i18n.t('ID_PLEASE_SELECT_USER_NAME_TO_BE_SEARCHED'),
                placeholder: this.$i18n.t('ID_USER_NAME'),
                tagText: "",
                tagPrefix:  this.$i18n.t('ID_SEARCH_BY_SEND_BY'),
                autoShow: true,
                items:[
                    {
                        id: "sendBy",
                        value: "",
                        options: [],
                        placeholder: this.$i18n.t('ID_USER_NAME')
                    }
                ],
                makeTagText: function (params, data) {
                    return  `${params.tagPrefix} : ${data[0].label || ''}`;
                }
            },
            {
                type: "TaskTitle",
                id: "taskTitle",
                title: `${this.$i18n.t("ID_FILTER")}: ${this.$i18n.t(
                    "ID_TASK_NAME"
                )}`,
                optionLabel: this.$i18n.t("ID_BY_TASK"),
                detail: "",
                tagText: "",
                tagPrefix: this.$i18n.t("ID_SEARCH_BY_TASK_NAME"),
                autoShow: true,
                items: [
                    {
                        id: "task",
                        value: "",
                        options: [],
                        placeholder: this.$i18n.t("ID_TASK_NAME"),
                    },
                ],
                makeTagText: function (params, data) {
                    return `${this.tagPrefix}: ${data[0].label || ""}`;
                },
            },
        ],
        processName: {
                type: "ProcessName",
                id: "processName",
                title: `${this.$i18n.t('ID_FILTER')}: ${this.$i18n.t('ID_BY_PROCESS_NAME')}`,
                optionLabel: this.$i18n.t('ID_BY_PROCESS_NAME'),
                detail: "",
                tagText: "",
                tagPrefix:  this.$i18n.t('ID_SEARCH_BY_PROCESS_NAME'),
                autoShow: true,
                items:[
                    {
                        id: "process",
                        value: "",
                        options: [],
                        placeholder: this.$i18n.t('ID_PROCESS_NAME')
                    }
                ],
                makeTagText: function (params, data) {
                    return  `${this.tagPrefix} ${data[0].options && data[0].options.label || ''}`;
                }
            },
        selected: "",
        itemModel: {},
        byProcessName: ""
    };
  },
  computed: {
    // a computed getter
    criteriaItems: function () {
      let found,
          criteria = [];
      if (this.hiddenItems && this.hiddenItems.length) {
          this.filterItems.forEach(item =>  {
              found = this.hiddenItems.find( elem  => elem !== item.id);
              if (found) {
                  criteria.push(item);
              }
          });
          return criteria;
      } else {
          return this.filterItems;
      }
    }
  },
  mounted() {
  },
  watch: {
    filters: { 
        immediate: true, 
        handler(newVal, oldVal) {
            this.searchTags = [];
            this.selected = [];
            //Prevent show popover at the first time
            if (newVal.length) {
                this.setFilters(newVal, oldVal);
                this.searchClickHandler();
            }
        }
    }
  },
  methods: {
    /**
     * Add filter criteria save button handler
     */
    onOk() {
        let self = this,  
            element,
            initialFilters = [],
            item;
        this.$root.$emit("bv::hide::popover");
        element = _.find(this.filterItems, function (o) {
            return o.id === self.selected;
        });
        if  (element) {
            initialFilters = this.prepareFilterItems(element.items, this.selected, true);
        }
        //adding process name filter 
        if (self.byProcessName !== "") {
            if (element !== undefined) {
                this.processName.autoShow = false;
            } else {
                this.processName.autoShow = true;
            }
            initialFilters =[...new Set([...initialFilters,...this.prepareFilterItems(this.processName.items, self.byProcessName, true)])];
        }
        this.$emit("onUpdateFilters", {params: initialFilters, refresh: false}); 
    },
    /**
     * Prepare the filter items
     * @param {array} items
     * @param {id} string
     * @param {boolean} restore
     */
    prepareFilterItems(items, id, restore){
        let initialFilters = [],
            self = this,
            filter,
            item;
        _.forEach(items, function(value, key) {
            filter = _.find(self.filters, function(o) { return o.filterVar === value.id; });
            if (filter && restore) {
                initialFilters.push(filter);
            } else {
                item = {
                    filterVar: value.id,
                    fieldId: id,
                    value:  '',
                    label: "",
                    options: [],
                    autoShow: true
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
      _.forEach(filters, function (item, key) {
        let component = _.find(self.filterItems, function (o) {
          return o.id === item.fieldId;
        });
        if (component) {
            self.searchTags.push(component.id);
            self.selected = component.id;
            self.itemModel[component.id] = component;
            self.itemModel[component.id].autoShow = typeof item.autoShow !== "undefined" ? item.autoShow : true;
        }
        if(item.fieldId === "processName") {
            self.searchTags.push(self.processName.id);
            self.byProcessName = self.processName.id;
            self.itemModel[self.processName.id] = self.processName;
            self.itemModel[self.processName.id].autoShow = typeof item.autoShow !== "undefined" ? item.autoShow : self.processName.autoShow;
        }
      });
    },
    dataToFilter(id) {
      let data = [];
      _.forEach(this.filters, function (item) {
        if (item.fieldId === id) {
          data.push(item);
        }
      });
      return data;
    },
    /**
     *
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
    tagComponent(id) {
      if (this.itemModel[id]) {
        return this.itemModel[id].type;
      }
      return null;
    },

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
            if(item.fieldId !== tag) { 
                temp.push(item);   
            }
        });
        if (tag === "processName") {
            this.byProcessName = "";
        }
        this.$emit("onUpdateFilters", {params: temp, refresh: true});
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
  font-size: 1.40rem;
  padding-right: 10px;
  line-height: 40px;
}
</style>