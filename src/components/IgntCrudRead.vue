<script setup lang="ts">
import { useClient } from "@/composables/useClient";
import { IgntFileIcon } from "@ignt/vue-library";
import { IgntDotsIcon } from "@ignt/vue-library";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { computed, ref } from "vue";
import { useAddress } from "@/def-composables/useAddress";
import { useRoute } from "vue-router";
import { smallCamelCase, bigCamelCase } from "@/utils/shared";

const route = useRoute();

const props = defineProps({
  storeName: {
    type: String,
    required: true
  },

  itemName: {
    type: String,
    required: true
  },

  commandName: {
    type: String,
    required: true
  }
});
const emit = defineEmits(["editItem", "deleteItem", "getItems"]);
const client = useClient();
const { address } = useAddress();
const loggedIn = computed(() => {
  return address.value != "";
});
const itemFields = (
  client[
    props.storeName as keyof Omit<
      typeof client,
      | "plugins"
      | "env"
      | "signer"
      | "registry"
      | "plugin"
      | "signAndBroadcast"
      | "useSigner"
      | "useKeplr"
    >
  ] as any
).structure[bigCamelCase(props.itemName)];
const items = ref<any>([]);

const fetch = async () => {
  return (
    await (
      client[
        props.storeName as keyof Omit<
          typeof client,
          | "plugins"
          | "env"
          | "signer"
          | "registry"
          | "plugin"
          | "signAndBroadcast"
          | "useSigner"
          | "useKeplr"
        >
      ] as any
    ).query[props.commandName]({
      deviceName: route.params.name,
      "pagination.reverse": true
    })
  ).data[smallCamelCase(props.itemName)];
};
const refetch = async () => {
  items.value = await fetch();

  emit("getItems", items.value);
};
defineExpose({ refetch });
await refetch();

const showContent = (str, key) => {
  if (route.name === "iot.device.events") {
    if (key === "payload") {
      return window.atob(str);
    }
  }

  return str;
};
</script>

<template>
  <div>
    <div v-if="items" class="max-w-xl">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex justify-between mb-6 items-start"
      >
        <div
          class="w-10 bg-gray-100 flex items-center justify-center h-10 rounded-lg mr-4"
        >
          <IgntFileIcon class="text-3xl" />
        </div>
        <div class="flex-1">
          <div v-for="field in itemFields.fields" :key="'field_' + field">
            <div class="text-sm text-gray-400 font-semibold capitalize">
              {{ field.name }}
            </div>
            <div class="mb-3 text-base">
              {{ showContent(item[field.name], field.name) }}
            </div>
          </div>
        </div>
        <div class="relative" v-if="address">
          <Menu>
            <MenuButton>
              <IgntDotsIcon class="hover:bg-gray-100 rounded-lg text-3xl" />
            </MenuButton>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-out"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <MenuItems class="absolute shadow-std px-3 w-40 rounded-lg">
                <MenuItem
                  :disabled="!loggedIn"
                  as="div"
                  class="cursor-pointer py-2 my-2 text-sm text-gray-500 ui-active:text-black ui-active:font-medium"
                  @click="emit('editItem', item)"
                  >Edit</MenuItem
                >
                <MenuItem
                  :disabled="!loggedIn"
                  as="div"
                  class="cursor-pointer py-2 my-2 text-sm text-red-500 ui-active:font-medium"
                  @click="emit('deleteItem', item)"
                  >Delete</MenuItem
                >
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
      <div v-if="(items || []).length === 0">
        <div class="my-4" />
        <div>No items</div>
      </div>
    </div>
  </div>
</template>
