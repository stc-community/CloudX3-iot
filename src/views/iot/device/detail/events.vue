<script setup lang="ts">
import IgntCrudCreate from "@/components/IgntCrudCreate.vue";
import { useClient } from "@/composables/useClient";
import { smallCamelCase } from "@/utils/shared";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import { getNewNostrPrivateKey } from "@/utils/shared";
import { useAddress } from "@/def-composables/useAddress";

const route = useRoute();
const client = useClient();

const events = ref([]);
const storeName = "StccommunityIotdepinprotocolIotdepinprotocol";
const itemName = "EventPb";

const fetchEvents = async () => {
  (client[storeName] as any).query["queryEventPbAll"]({
    deviceName: route.params.name,
    "pagination.reverse": true
  }).then(res => {
    events.value = res.data[smallCamelCase(itemName)];
  });
};

fetchEvents();

interface Payload {
  payload_type: string;
  path: string;
  data: string;
  result: string;
}
const payloads = computed<Payload[]>(() => {
  return events.value.map(e => {
    const payload = window.atob(e.payload);
    try {
      const obj = JSON.parse(payload);

      return {
        payload_type: obj?.payload_type,
        path: obj?.path,
        data: obj?.data,
        result: obj?.result
      };
    } catch (e) {
      return {
        payload_type: "-",
        path: "-",
        data: "-",
        result: "-"
      };
    }
  });
});

// Add event
const { address } = useAddress();
const moduleNameNormalized = computed(() =>
  itemName.replace(/^\w/, c => c.toUpperCase())
);
const visibleModal = ref("");
const createModalInitalForm = computed(() => {
  return {
    deviceName: route.params.name,
    index: getNewNostrPrivateKey()
  };
});

const onAdd = () => {
  visibleModal.value = "create-item";
};
const onClose = () => {
  visibleModal.value = "";
  fetchEvents();
};
</script>
<template>
  <h2>Event Sources</h2>
  <p class="text-slate-500 mt-2 leading-6">
    You can create various W3bstream events that can be generated from diverse
    sources: through an HTTP or MQTT data message or utizing internal sources
    such as the Cron Job or Smart Contract Monitor.
  </p>

  <div class="text-right">
    <button class="btn btn-primary mt-5" @click="onAdd" v-if="address">
      Add Event
    </button>
  </div>

  <IgntCrudCreate
    v-if="visibleModal === 'create-item'"
    :store-name="storeName"
    :item-name="moduleNameNormalized"
    :command-name="`sendMsgCreate${moduleNameNormalized}`"
    :inital-data="createModalInitalForm"
    @close="onClose"
  />

  <div class="overflow-x-auto mt-10">
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th />
          <th>Payload Type</th>
          <th>Path</th>
          <th>Data</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, k) in payloads" :key="k">
          <th>{{ k + 1 }}</th>
          <td>{{ data.payload_type }}</td>
          <td>{{ data.path }}</td>
          <td>{{ data.data }}</td>
          <td>{{ data.result }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
