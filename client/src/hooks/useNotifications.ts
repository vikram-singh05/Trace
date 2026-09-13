import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import type { Notification } from '../api/notificationApi';
import { getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getMyNotifications,
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onMutate: async (id) => {

      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], old =>
        old?.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], old =>
        old?.map(n => ({ ...n, isRead: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
  });

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    const handleNewNotification = (notification: Notification) => {
      // Update cache with new notification at the top
      queryClient.setQueryData<Notification[]>(['notifications'], old => {
        return old ? [notification, ...old] : [notification];
      });

      if (notification.relatedItemId) {
        queryClient.invalidateQueries({ queryKey: ['item', notification.relatedItemId] });
        queryClient.invalidateQueries({ queryKey: ['claims', notification.relatedItemId] });
      }
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [user, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
  };
}
