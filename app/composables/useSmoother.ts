import { ref } from "vue";
const smootherInstance = ref<any>(null);

export const useSmoother = () => {
  const setSmoother = (instance: any) => {
    smootherInstance.value = instance;
  };

  return {
    smoother: smootherInstance,
    setSmoother,
  };
};
