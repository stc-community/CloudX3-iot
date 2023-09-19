import { reactive, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { loadData } from "@/utils/shared";
import yaml from "js-yaml";

export function useIotEvents() {
  const route = useRoute();

  const data = reactive({
    data: ""
  });
  const loading = ref(false);

  const instructions = computed(() => {
    try {
      const res = data.data;

      const json = yaml.load(res, "utf-8");

      return Object.keys(json?.instructions);
    } catch (e) {
      return [];
    }
  });

  const getIotDeviceInstructions = async () => {
    loading.value = true;
    loadData(
      data,
      "iot.device.instructions",
      {
        mid: route.params.mid
      },
      loading
    );
  };

  return {
    data,
    loading,
    getIotDeviceInstructions,
    instructions
  };
}
