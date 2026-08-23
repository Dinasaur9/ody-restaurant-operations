import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMenuQueryKey, useCreateMenuCategory, useCreateMenuItem, useGetMenu, useUpdateMenuItem, type CreateMenuCategory, type CreateMenuItem, type MenuItem, type UpdateMenuItem } from "@ody/api-client";

export function useMenuOperations() {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [notice, setNotice] = useState<string>();
  const menu = useGetMenu();
  const refresh = () => queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey() });
  const createCategoryMutation = useCreateMenuCategory({ mutation: { onSuccess: async (category) => { setCategoryOpen(false); setNotice(`${category.name} was added.`); await refresh(); } } });
  const createItemMutation = useCreateMenuItem({ mutation: { onSuccess: async (item) => { setEditorOpen(false); setNotice(`${item.name} was added to the menu.`); await refresh(); } } });
  const updateItemMutation = useUpdateMenuItem({ mutation: { onSuccess: async (item) => { setEditorOpen(false); setEditingItem(null); setNotice(`${item.name} was updated.`); await refresh(); } } });

  return {
    menu,
    editorOpen,
    categoryOpen,
    editingItem,
    notice,
    clearNotice: () => setNotice(undefined),
    openCreate: () => { setEditingItem(null); setEditorOpen(true); },
    openEdit: (item: MenuItem) => { setEditingItem(item); setEditorOpen(true); },
    closeEditor: () => { setEditorOpen(false); setEditingItem(null); },
    openCategory: () => setCategoryOpen(true),
    closeCategory: () => setCategoryOpen(false),
    saveItem: (data: CreateMenuItem | UpdateMenuItem) => editingItem ? updateItemMutation.mutate({ id: editingItem.id, data: data as UpdateMenuItem }) : createItemMutation.mutate({ data: data as CreateMenuItem }),
    saveCategory: (data: CreateMenuCategory) => createCategoryMutation.mutate({ data }),
    toggleAvailability: (item: MenuItem) => updateItemMutation.mutate({ id: item.id, data: { categoryId: item.categoryId, name: item.name, description: item.description, price: item.price, prepMinutes: item.prepMinutes, isAvailable: !item.isAvailable } }),
    pending: createItemMutation.isPending || updateItemMutation.isPending,
    categoryPending: createCategoryMutation.isPending,
    error: createItemMutation.error || updateItemMutation.error,
    categoryError: createCategoryMutation.error,
  };
}
