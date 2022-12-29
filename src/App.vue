<template>
  <v-app>
    <v-app-bar app style="backdrop-filter: blur(10px)" clipped-right>
      <v-spacer />
      <v-divider class="mx-4" vertical />
    </v-app-bar>

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
        <v-card-title>Beschreibung</v-card-title>
        <v-card-text>
          <span v-html="selectedItem.description"></span>
        </v-card-text>
        <v-card-title> Kommentar </v-card-title>
        <v-card-text>
          <span v-html="selectedItem.kommentar"></span>
        </v-card-text>
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
              SPOK Daten
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchPhrase"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                clearable
              ></v-text-field>
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
              item-key="field3"
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
              <template #[`item.sapCarType`]="{ item }">
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">{{ item.sapCarType }}</span>
                  </template>
                  <span>{{ "ZTyp: " + item.carTypeId }}</span>
                </v-tooltip>
              </template>
              <template #[`item.createdByFullName`]="{ item }">
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <v-avatar
                      :color="item.createdByAvatarColor"
                      size="32"
                      class="ma-1"
                      v-bind="attrs"
                      v-on="on"
                      ><span class="white--text">{{
                        item.createdByInitials
                      }}</span></v-avatar
                    >
                  </template>
                  <span>{{ item.createdByFullName }}</span>
                </v-tooltip>
              </template>
              <template #[`item.agentFullName`]="{ item }">
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <v-avatar
                      :color="item.agentAvatarColor"
                      size="32"
                      class="ma-1"
                      v-bind="attrs"
                      v-on="on"
                      ><span class="white--text">{{
                        item.agentInitials
                      }}</span></v-avatar
                    >
                  </template>
                  <span>{{ item.agentFullName }}</span>
                </v-tooltip>
              </template>
              <template #[`item.createdAt`]="{ item }">
                <v-chip v-if="item.createdAt" small outlined>{{
                  $d(new Date(item.createdAt), "middle")
                }}</v-chip>
              </template>

              <template #[`item.targetDate`]="{ item }">
                <template v-if="item.targetDate">
                  <v-chip
                    v-if="!['closed', 'canceled'].includes(item.status)"
                    small
                    :color="
                      new Date(item.targetDate) > new Date()
                        ? 'success'
                        : 'error'
                    "
                    >{{ $d(new Date(item.targetDate), "short") }}</v-chip
                  >
                  <v-chip v-else small outlined>{{
                    $d(new Date(item.targetDate), "short")
                  }}</v-chip>
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
import games from "./games-100.json";

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
    availableFilters: [
      {
        field: "name",
        title: "Name",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: false,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: false,
      },
      {
        field: "poolid",
        title: "poolid",
        selectedItems: [],
        selectedItem: "",
        initialItems: [],
        reactive: false,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: false,
      },
    ],
    headers: [
      { text: "gameId", value: "gameid", width: 120 },
      { text: "poolId", value: "poolid" },
      { text: "name", value: "name" },
      { text: "description", value: "description" },
      { text: "kommentar", value: "kommentar" },
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
    async init() {
      this.gamesFiltered = dataFilter.applyFilters(
        this.workOrders,
        this.availableFilters
      );
      dataFilter.initFilters(this.workOrders, this.availableFilters);
      this.onResize();
    },
    getFilter(field) {
      return this.availableFilters.filter((item) => item.field === field)[0];
    },
    updateAndApplyFilters(field) {
      console.log("updateAndApplyFilters");
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
      this.tableHeight = window.innerHeight - 480;
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
