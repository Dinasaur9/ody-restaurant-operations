import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetOrderingSettingsQueryKey, useGetOrderingSettings, useUpdateOrderingSettings, type UpdateOrderingSettings } from "@ody/api-client";

export function useSettingsOperations() {
  const queryClient = useQueryClient();
  const settings = useGetOrderingSettings();
  const [form, setForm] = useState<UpdateOrderingSettings>({ restaurantName: "", prepTimeMinutes: 20, autoAcceptOrders: false, serviceEnabled: true, openingTime: "09:00", closingTime: "22:00" });
  const [saved, setSaved] = useState<string>();

  useEffect(() => {
    if (!settings.data) return;
    setForm({
      restaurantName: settings.data.restaurantName,
      prepTimeMinutes: settings.data.prepTimeMinutes,
      autoAcceptOrders: settings.data.autoAcceptOrders,
      serviceEnabled: settings.data.serviceEnabled,
      openingTime: settings.data.openingTime,
      closingTime: settings.data.closingTime,
    });
  }, [settings.data]);

  const mutation = useUpdateOrderingSettings({
    mutation: {
      onSuccess: async () => {
        setSaved("Ordering settings saved.");
        await queryClient.invalidateQueries({ queryKey: getGetOrderingSettingsQueryKey() });
      },
    },
  });

  return {
    settings,
    form,
    setField: <K extends keyof UpdateOrderingSettings>(field: K, value: UpdateOrderingSettings[K]) => setForm((current) => ({ ...current, [field]: value })),
    save: () => mutation.mutate({ data: form }),
    pending: mutation.isPending,
    error: mutation.error,
    saved,
    clearSaved: () => setSaved(undefined),
  };
}
