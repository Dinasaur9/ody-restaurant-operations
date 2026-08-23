import { useEffect, useMemo, useState } from "react";
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
      onSuccess: async (data) => {
        setForm({
          restaurantName: data.restaurantName,
          prepTimeMinutes: data.prepTimeMinutes,
          autoAcceptOrders: data.autoAcceptOrders,
          serviceEnabled: data.serviceEnabled,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
        });
        queryClient.setQueryData(getGetOrderingSettingsQueryKey(), data);
        setSaved("Ordering settings saved.");
        await queryClient.invalidateQueries({ queryKey: getGetOrderingSettingsQueryKey() });
      },
    },
  });

  const dirty = useMemo(() => {
    if (!settings.data) return false;
    return form.restaurantName !== settings.data.restaurantName
      || form.prepTimeMinutes !== settings.data.prepTimeMinutes
      || form.autoAcceptOrders !== settings.data.autoAcceptOrders
      || form.serviceEnabled !== settings.data.serviceEnabled
      || form.openingTime !== settings.data.openingTime
      || form.closingTime !== settings.data.closingTime;
  }, [form, settings.data]);

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  const valid = form.restaurantName.trim().length >= 2
    && form.prepTimeMinutes >= 5
    && form.prepTimeMinutes <= 120
    && timePattern.test(form.openingTime)
    && timePattern.test(form.closingTime)
    && form.openingTime < form.closingTime;

  return {
    settings,
    form,
    setField: <K extends keyof UpdateOrderingSettings>(field: K, value: UpdateOrderingSettings[K]) => {
      setSaved(undefined);
      mutation.reset();
      setForm((current) => ({ ...current, [field]: value }));
    },
    save: () => {
      if (dirty && valid) mutation.mutate({ data: { ...form, restaurantName: form.restaurantName.trim() } });
    },
    pending: mutation.isPending,
    error: mutation.error,
    saved,
    dirty,
    valid,
    clearSaved: () => setSaved(undefined),
  };
}
