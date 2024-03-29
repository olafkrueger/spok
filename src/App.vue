<template>
  <v-app>
    <v-navigation-drawer
      v-model="showPreview"
      app
      right
      temporary
      stateless
      hide-overlay
      width="800"
    >
      <v-card v-if="selectedItem" flat tile>
        <v-toolbar tile>
          <v-btn icon @click="showPreview = !showPreview"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-toolbar>
        <v-card flat tile class="px-10">
          <v-card-title>Beschreibung</v-card-title>
          <v-card-text>
            <span v-html="selectedItem.description"></span>
          </v-card-text>
          <v-card-title> Kommentar </v-card-title>
          <v-card-text>
            <span v-html="selectedItem.kommentar"></span>
          </v-card-text>
        </v-card>
      </v-card>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-10">
        <v-card color="transparent" flat>
          <v-card class="mb-3" flat>
            <v-card-title> Filter </v-card-title>
            <v-container fluid>
              <v-row>
                <template v-for="filter in availableFilters">
                  <v-col
                    v-if="
                      getFilter(filter.field).items.length > 0 &&
                      getFilter(filter.field).visible == true
                    "
                    :key="'card-' + filter.title"
                    cols="2"
                  >
                    <v-autocomplete
                      v-if="filter.multiple == true"
                      v-model="getFilter(filter.field).selectedItems"
                      :items="getFilter(filter.field).items"
                      outlined
                      dense
                      chips
                      clearable
                      small-chips
                      :label="filter.title"
                      :value="filter.field"
                      item-text="value"
                      item-value="value"
                      :multiple="getFilter(filter.field).multiple"
                      deletable-chips
                      hide-details
                      @change="updateAndApplyFilters(filter.field)"
                    >
                      <template #item="{ item }">
                        {{ item.value + " (" + item.count + ")" }}
                      </template>
                    </v-autocomplete>
                    <v-autocomplete
                      v-else
                      v-model="getFilter(filter.field).selectedItem"
                      :items="getFilter(filter.field).items"
                      outlined
                      dense
                      chips
                      clearable
                      small-chips
                      :label="filter.title"
                      :value="filter.field"
                      item-text="value"
                      item-value="value"
                      :multiple="getFilter(filter.field).multiple"
                      deletable-chips
                      hide-details
                      @change="updateAndApplyFilters(filter.field)"
                    >
                      <template #item="{ item }">
                        {{ item.value + " (" + item.count + ")" }}
                      </template>
                    </v-autocomplete>
                  </v-col>
                </template>
              </v-row>
            </v-container>
          </v-card>
          <v-card flat>
            <v-card-title>
              Daten
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchPhrase"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                clearable
              ></v-text-field>
              <v-btn
                small
                text
                :loading="isExporting"
                @click="downloadAsCSVFile()"
                >Export as CSV</v-btn
              >
            </v-card-title>
            <v-data-table
              v-model="selectedItems"
              v-resize="onResize"
              :items="gamesFiltered"
              dense
              :search="searchPhrase"
              :headers="headers"
              fixed-header
              :height="tableHeight"
              multi-sort
              item-key="gameid"
              :items-per-page="100"
              single-select
              :show-select="false"
              loading-text="Loading... Please wait"
              class="text-body-2"
              @click:row="onItemClick"
            >
              <template #[`item.description`]="{ item }">
                <span
                  v-html="
                    item.description.length > 100
                      ? item.description.substring(0, 100 - 3) + '...'
                      : item.description
                  "
                ></span>
              </template>
              <template #[`item.kommentar`]="{ item }">
                <span
                  v-html="
                    item.kommentar.length > 100
                      ? item.kommentar.substring(0, 100 - 3) + '...'
                      : item.kommentar
                  "
                ></span>
              </template>

              <template #[`item.kategorie1TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie1TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie1TagNames"
                    :key="tagName"
                    x-small
                    color="purple"
                    dark
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
              <template #[`item.kategorie2TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie2TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie2TagNames"
                    :key="tagName"
                    x-small
                    color="orange"
                    dark
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
              <template #[`item.kategorie3TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie3TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie3TagNames"
                    :key="tagName"
                    x-small
                    color="green"
                    dark
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
              <template #[`item.kategorie4TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie4TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie4TagNames"
                    :key="tagName"
                    x-small
                    color="blue"
                    dark
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
              <template #[`item.kategorie5TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie5TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie5TagNames"
                    :key="tagName"
                    x-small
                    color="red"
                    dark
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
              <template #[`item.kategorie6TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie6TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie6TagNames"
                    :key="tagName"
                    x-small
                    outlined
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
              <template #[`item.kategorie7TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie7TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie7TagNames"
                    :key="tagName"
                    x-small
                    outlined
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
              <template #[`item.kategorie8TagNames`]="{ item }">
                <template v-if="Array.isArray(item.kategorie8TagNames)">
                  <v-chip
                    v-for="tagName in item.kategorie8TagNames"
                    :key="tagName"
                    x-small
                    outlined
                    class="ma-1"
                    >{{ tagName }}</v-chip
                  >
                </template>
              </template>
            </v-data-table>
          </v-card>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import dataFilter from "@/utils/data-filter.js";
import games from "../data/gamesJoined.json";

export default {
  name: "MainApp",
  components: {},
  props: {},
  data: () => ({
    httpError: null,
    foo: null,
    workOrders: [],
    gamesFiltered: [],
    showPreview: false,
    statusEnumeration: [],
    pendingChangeRequests: [],
    isLoading: false,
    isEnumerationLoading: false,
    searchPhrase: null,
    selectedItem: null,
    selectedItems: [],
    tableHeight: null,
    isExporting: false,
    availableFilters: [
      {
        field: "poolTitle",
        title: "poolTitle",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie1TagNames",
        title: "kategorie1TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie2TagNames",
        title: "kategorie2TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie3TagNames",
        title: "kategorie3TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie4TagNames",
        title: "kategorie4TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie5TagNames",
        title: "kategorie5TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie6TagNames",
        title: "kategorie6TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie7TagNames",
        title: "kategorie7TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "kategorie8TagNames",
        title: "kategorie8TagNames",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
    ],
    headers: [
      { text: "gameId", value: "gameid", width: 50 },
      //{ text: "poolId", value: "poolid" },
      { text: "poolTitle", value: "poolTitle" },
      { text: "gameName", value: "name" },
      { text: "description", value: "description", width: 80 },
      //{ text: "kategorie1", value: "kategorie1" },
      { text: "kategorie1TagNames", value: "kategorie1TagNames" },
      //{ text: "kategorie2", value: "kategorie2" },
      { text: "kategorie2TagNames", value: "kategorie2TagNames" },
      //{ text: "kategorie3", value: "kategorie3" },
      { text: "kategorie3TagNames", value: "kategorie3TagNames" },
      //{ text: "kategorie4", value: "kategorie4" },
      { text: "kategorie4TagNames", value: "kategorie4TagNames" },
      //{ text: "kategorie5", value: "kategorie5" },
      { text: "kategorie5TagNames", value: "kategorie5TagNames" },
      //{ text: "kategorie6", value: "kategorie6" },
      { text: "kategorie6TagNames", value: "kategorie6TagNames" },
      { text: "kategorie7TagNames", value: "kategorie7TagNames" },
      { text: "kategorie8TagNames", value: "kategorie8TagNames" },
    ],
  }),
  computed: {
    selectedState: {
      set(state) {
        this.$router.replace({ query: { ...this.$route.query, state } });
      },
      get() {
        return this.$route.query.state;
      },
    },
    statusEnumerationMap() {
      let enumMap = {};
      for (let i = 0; i < this.statusEnumeration.length; i++) {
        enumMap[this.statusEnumeration[i].value] = this.statusEnumeration[i];
      }
      return enumMap;
    },
    numberOfPendingChangeRequests: function () {
      return this.pendingChangeRequests.length;
    },
  },
  watch: {},
  mounted() {
    this.gamesFiltered = dataFilter.applyFilters(games, this.availableFilters);
    dataFilter.initFilters(games, this.availableFilters);
    this.onResize();
  },

  methods: {
    downloadAsCSVFile() {
      this.isExporting = true;
      const { parse } = require("json2csv");
      let csv;
      const fields = [
        "gameid",
        "poolTitle",
        "name",
        "description",
        "kategorie1TagNames",
        "kategorie2TagNames",
        "kategorie3TagNames",
        "kategorie4TagNames",
        "kategorie5TagNames",
        "kategorie6TagNames",
        "kategorie7TagNames",
        "kategorie8TagNames",
        "kommentar",
      ];
      const opts = { fields: fields, delimiter: ";" };
      const { convert } = require("html-to-text");
      try {
        csv = parse(
          this.gamesFiltered.map((item) => {
            return {
              ...item,
              description: convert(item.description, {
                wordwrap: 130,
              }),
              kategorie1TagNames: item.kategorie1TagNames.join("\n"),
              kategorie2TagNames: item.kategorie2TagNames.join("\n"),
              kategorie3TagNames: item.kategorie3TagNames.join("\n"),
              kategorie4TagNames: item.kategorie4TagNames.join("\n"),
              kategorie5TagNames: item.kategorie5TagNames.join("\n"),
              kategorie6TagNames: item.kategorie6TagNames.join("\n"),
              kategorie7TagNames: item.kategorie7TagNames.join("\n"),
              kategorie8TagNames: item.kategorie8TagNames.join("\n"),
              kommentar: convert(item.kommentar, {
                wordwrap: 130,
              }),
            };
          }),
          opts
        );
      } catch (err) {
        console.error(err);
      } finally {
        this.isExporting = false;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "spok.csv";
      link.click();
      URL.revokeObjectURL(link.href);
      this.isExporting = false;
    },
    getFilter(field) {
      return this.availableFilters.filter((item) => item.field === field)[0];
    },
    updateAndApplyFilters(field) {
      // Apply filters on work order list
      this.gamesFiltered = dataFilter.applyFilters(
        games,
        this.availableFilters
      );
      // Update filter items
      this.availableFilters = dataFilter.updateFilters(
        games,
        this.availableFilters,
        field
      );
    },
    onStatusUpdated(workOrder) {
      this.selectedItems[0].status = workOrder.status;

      this.replaceWorkOrder(workOrder);

      // Re-init fiters
      dataFilter.initFilters(this.workOrders, this.availableFilters);
      // Update filters
      this.availableFilters = dataFilter.updateFilters(
        this.workOrders,
        this.availableFilters,
        "fake"
      );
      // Applying the filters would mean that the selected work order moves out of the list
      // This might be confusing for the user
      // dataFilter.applyFilters(
      //  this.workOrders,
      //  this.availableFilters
      // )
    },
    replaceWorkOrder(workOrder) {
      let index = this.gamesFiltered.findIndex(
        (item) => item.id === workOrder.id
      );
      this.gamesFiltered[index].status = workOrder.status;

      index = this.workOrders.findIndex((item) => item.id === workOrder.id);
      this.workOrders[index].status = workOrder.status;
    },
    onHttpError(error) {
      this.httpError = error;
    },
    onItemClick(item, row) {
      // Highlight selected row (See custom style "tr.v-data-table__selected")
      row.select(true);
      this.selectedItem = item;
      this.showPreview = true;
    },
    onResize() {
      this.tableHeight = window.innerHeight - 430;
    },
    async fetchWorkOrders() {},
    async fetchStatusEnumeration() {
      try {
        this.isEnumerationLoading = true;
        this.statusEnumeration = (
          await this.$api.prototypingWorkOrderStatusEnumerationGet(
            "placeholder"
          )
        ).data.items;
      } catch (err) {
        this.httpError = err;
      }
      this.isEnumerationLoading = false;
    },
    async fetchChangeRequests() {
      this.pendingChangeRequests = (
        await this.$api.prototypingGetAllPendingChangeRequests()
      ).data.changeRequests;
    },
    gotoChangeRequests() {
      this.$router.push({
        name: "prototyping.companies.company-id.work-orders.change-requests",
        params: {},
      });
    },
  },
};
</script>

<style>
tr.v-data-table__selected {
  background: #eceff1 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
