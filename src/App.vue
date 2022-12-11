<template>
  <div id="app">
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
              <v-chip-group
                v-if="getFilter('status').multiple == true"
                v-model="getFilter('status').selectedItems"
                active-class="primary--text"
                column
                :multiple="getFilter('status').multiple"
                class="mt-3"
                @change="updateAndApplyFilters('status')"
              >
                <v-chip
                  v-for="item in getFilter('status').items.filter(
                    (item) => item.count > 0
                  )"
                  :key="item.value"
                  :value="item.value"
                  filter
                  :ripple="false"
                  outlined
                  small
                  ><v-icon left>{{ statusIconMap[item.value] }}</v-icon
                  >{{ item.value + " (" + item.count + ")" }}</v-chip
                >
              </v-chip-group>
              <v-chip-group
                v-else
                v-model="getFilter('status').selectedItem"
                active-class="primary--text"
                column
                class="mt-3"
                :multiple="getFilter('status').multiple"
                @change="updateAndApplyFilters('status')"
              >
              </v-chip-group>
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
              :items="filteredGames"
              dense
              :search="searchPhrase"
              :headers="headers"
              fixed-header
              :height="tableHeight"
              :sort-by="['createdAt']"
              :sort-desc="[true]"
              multi-sort
              item-key="id"
              :items-per-page="100"
              single-select
              :show-select="false"
              loading-text="Loading... Please wait"
              class="text-body-2"
              @click:row="onItemClick"
            >
              <template #[`item.name`]="{ item }">
                <router-link
                  :to="{
                    name: 'prototyping.companies.company-id.work-orders.work-order-id',
                    params: { companyId: companyId, workOrderId: item.id },
                  }"
                  >{{ item.name }}
                </router-link>
              </template>
              <template #[`item.status`]="{ item }">
                <status-chip
                  :enumeral="statusEnumerationMap[item.status]"
                  small
                />
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
  </div>
</template>

<script>
import dataFilter from "@/utils/data-filter.js";

export default {
  name: "MainApp",
  components: {},
  props: {
    companyId: { type: String, required: true },
  },
  data: () => ({
    httpError: null,
    workOrders: [],
    filteredGames: [],
    showPreview: false,
    statusEnumeration: [],
    filteredWorkOrders: [],
    pendingChangeRequests: [],
    isLoading: false,
    isEnumerationLoading: false,
    searchPhrase: null,
    selectedItems: [],
    tableHeight: null,
    availableFilters: [
      {
        field: "status",
        title: "Status",
        selectedItems: [],
        selectedItem: "",
        initialItems: [
          { value: "new", count: -1 },
          { value: "accepted", count: -1 },
          { value: "not_accepted", count: -1 },
          { value: "in_progress", count: -1 },
          { value: "attention", count: -1 },
          { value: "in_revision", count: -1 },
          { value: "paused", count: -1 },
          { value: "finished", count: -1 },
          { value: "closed", count: -1 },
          { value: "canceled", count: -1 },
          { value: "unknown", count: -1 },
        ],
        reactive: true,
        exclude: [],
        items: [],
        multiple: false,
        visible: false,
        sort: false,
      },
      {
        field: "createdByFullName",
        title: "Issuer",
        selectedItems: [],
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "sapCustomer",
        title: "Customer",
        selectedItems: [],
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "sapCarType",
        title: "Car type",
        selectedItems: [],
        initialItems: [],
        reactive: true,
        exclude: [],
        items: [],
        multiple: true,
        visible: true,
        sort: true,
      },
      {
        field: "sapProductSegment",
        title: "Product segment",
        selectedItems: [],
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
      { text: "Order no.", value: "name", width: 120 },
      { text: "Status", value: "status" },
      { text: "Company code", value: "sapCompanyCode" },
      { text: "Customer", value: "sapCustomer" },
      { text: "Car type", value: "sapCarType" },
      { text: "Segment", value: "sapProductSegment" },
      { text: "Created by", value: "createdByFullName" },
      { text: "Subject", value: "subject" },
      { text: "Number of Parts", value: "numberOfParts" },
      { text: "Created at", value: "createdAt" },
      { text: "Target date", value: "targetDate" },
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
  async mounted() {
    const csvtojsonV2 = require("csvtojson");
    this.filteredGames = await csvtojsonV2().fromFile("../data/games.csv");
  },

  methods: {
    async init(companyId) {
      this.fetchChangeRequests();
      await this.fetchStatusEnumeration();
      await this.fetchWorkOrders(companyId);
      this.filteredWorkOrders = dataFilter.applyFilters(
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
      // Apply filters on work order list
      this.filteredWorkOrders = dataFilter.applyFilters(
        this.workOrders,
        this.availableFilters
      );
      // Update filter items
      this.availableFilters = dataFilter.updateFilters(
        this.workOrders,
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
      let index = this.filteredWorkOrders.findIndex(
        (item) => item.id === workOrder.id
      );
      this.filteredWorkOrders[index].status = workOrder.status;

      index = this.workOrders.findIndex((item) => item.id === workOrder.id);
      this.workOrders[index].status = workOrder.status;
    },
    onHttpError(error) {
      this.httpError = error;
    },
    onItemClick(item, row) {
      // Highlight selected row (See custom style "tr.v-data-table__selected")
      row.select(true);
      this.showPreview = true;
    },
    onResize() {
      this.tableHeight = window.innerHeight - 480;
    },
    async fetchWorkOrders(companyId) {
      this.isLoading = true;
      try {
        this.workOrders = (
          await this.$api.prototypingGetWorkOrdersByCompany(companyId)
        ).data;
      } catch (err) {
        this.httpError = err;
      }
      this.isLoading = false;
    },
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
        params: {
          companyId: this.companyId,
        },
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
