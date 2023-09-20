<script setup lang="ts">
import { useClient } from "@/composables/useClient";
import { smallCamelCase } from "@/utils/shared";
import { useRoute } from "vue-router";
import { ref, computed } from "vue";

const route = useRoute();
const client = useClient();

const events = ref([]);

const fetchEvents = async () => {
  (client["StccommunityIotdepinprotocolIotdepinprotocol"] as any).query[
    "queryEventPbAll"
  ]({
    deviceName: route.params.name,
    "pagination.reverse": true
  }).then(res => {
    events.value = res.data[smallCamelCase("EventPb")];
  });
};

fetchEvents();

interface Payload {
  payload_type: string;
  path: string;
  data: string;
}
const payloads = computed<Payload[]>(() => {
  return events.value.map(e => {
    const payload = window.atob(e.payload);
    try {
      const obj = JSON.parse(payload);

      return {
        payload_type: obj?.payload_type,
        path: obj?.path,
        data: obj?.data
      };
    } catch (e) {
      return {
        payload_type: "-",
        path: "-",
        data: "-"
      };
    }
  });
});
</script>
<template>
  <h2>Event Sources</h2>
  <p class="text-slate-500 mt-2 leading-6">
    You can create various W3bstream events that can be generated from diverse
    sources: through an HTTP or MQTT data message or utizing internal sources
    such as the Cron Job or Smart Contract Monitor.
  </p>

  <div class="overflow-x-auto mt-10">
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th />
          <th>Payload Type</th>
          <th>Path</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, k) in payloads" :key="k">
          <th>{{ k + 1 }}</th>
          <td>{{ data.payload_type }}</td>
          <td>{{ data.path }}</td>
          <td>{{ data.data }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
