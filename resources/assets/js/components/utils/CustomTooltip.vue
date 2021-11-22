<template>
    <span
        :id="`label-${data.id}`"
        @mouseover="hoverHandler"
        @mouseleave="unhoverHandler"
        v-bind:class="{highlightText: isHighlight, loadingTooltip: isLoading}"
    >
        {{ data.title }}
        <b-tooltip 
            :target="`label-${data.id}`"
            :show.sync="showTooltip"
            v-if="showTooltip"
        >
            {{ labelTooltip }}
            <p v-if="labelDescription !== ''">
                {{ labelDescription }}
            </p>
        </b-tooltip>
    </span>
</template>

<script>
import api from "./../../api/index";

export default {
    name: "CustomTooltip",
    props: {
        data: Object
    },
    data() {
        return {
            labelTooltip: "",
            labelDescription: "",
            hovering: "",
            show: false,
            menuMap: {
                CASES_INBOX: "inbox",
                CASES_DRAFT: "draft",
                CASES_PAUSED: "paused",
                CASES_SELFSERVICE: "unassigned"
            },
            isHighlight: false,
            showTooltip: false,
            isLoading: false,
            loading: ""
        };
    },
    methods: {
        /**
         * Delay the hover event
         */
        hoverHandler() {
            this.loading = setTimeout(() => { this.isLoading = true }, 1000) ;
            this.hovering = setTimeout(() => { this.setTooltip() }, 3000);
        },
        /**
         * Reset the delay and hide the tooltip
         */
        unhoverHandler() {
            this.labelTooltip = "";
            this.labelDescription = "";
            this.showTooltip = false;
            this.isLoading = false;
            clearTimeout(this.loading);
            clearTimeout(this.hovering);
        },
        /**
         * Set the label to show in the tooltip
         */
        setTooltip() {
            let that = this;
            if (this.menuMap[this.data.id]) {
                api.menu.getTooltip(that.data.page).then((response) => {
                    that.showTooltip = true;
                    that.isLoading = false;
                    that.labelTooltip = response.data.label;
                });
            } else {
                api.menu.getTooltipCaseList(that.data)
                .then((response) => {
                    that.showTooltip = true;
                    that.isLoading = false;
                    that.labelTooltip = response.data.label;
                    that.labelDescription = response.data.description;
                });
            }
        },
        /**
         * Set bold the label 
         */
        setHighlight() {
            this.isHighlight = true;
        }
    },
};
</script>
<style>
.highlightText {
    font-weight: 900;
}
.loadingTooltip {
    cursor: wait;
}
</style>
