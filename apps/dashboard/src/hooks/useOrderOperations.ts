import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getGetOrderQueryKey,
  getGetOrdersQueryKey,
  useCreateOrder,
  useGetMenu,
  useGetOrder,
  useGetOrders,
  useUpdateOrderStatus,
  type CreateOrder,
  type GetOrdersParams,
  type UpdateOrderStatus,
} from "@ody/api-client";

export function useOrderOperations() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<GetOrdersParams>({});
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string>();

  const orders = useGetOrders(filters);
  const order = useGetOrder(selectedOrderId ?? 0, {
    query: { enabled: selectedOrderId !== null },
  });
  const menu = useGetMenu({ query: { enabled: createOpen } });

  const refreshOrders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }),
    ]);
  };

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: async (created) => {
        setCreateOpen(false);
        setNotice(`${created.displayId} was sent to the kitchen.`);
        await refreshOrders();
      },
    },
  });

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: async (updated) => {
        setNotice(`${updated.displayId} is now ${updated.status.replace("_", " ")}.`);
        await Promise.all([
          refreshOrders(),
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(updated.id) }),
        ]);
      },
    },
  });

  return {
    filters,
    setFilters,
    selectedOrderId,
    setSelectedOrderId,
    createOpen,
    setCreateOpen,
    notice,
    clearNotice: () => setNotice(undefined),
    orders,
    order,
    menu,
    createOrder: (data: CreateOrder) => createOrder.mutate({ data }),
    createPending: createOrder.isPending,
    createError: createOrder.error,
    updateStatus: (id: number, data: UpdateOrderStatus) => updateStatus.mutate({ id, data }),
    statusPending: updateStatus.isPending,
    statusError: updateStatus.error,
  };
}
