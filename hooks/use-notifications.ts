"use client";

import useSWR from "swr";
import axios from "axios";
import { Notification } from "@/types";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function useNotifications() {
  const { data, error, mutate } = useSWR<Notification[]>("/api/notifications", fetcher, {
    revalidateOnFocus: false,
  });

  const markAsRead = async (id: string) => {
    await axios.patch("/api/notifications", { id, read: true });
    await mutate();
  };

  return {
    notifications: data || [],
    markAsRead,
    isLoading: !data && !error,
    mutate,
  };
}
