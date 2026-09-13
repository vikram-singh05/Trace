import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../api/notificationApi';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const prevUnreadRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 700);
      prevUnreadRef.current = unreadCount;
      return () => clearTimeout(timer);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const closeDropdown = useCallback(() => {
    if (isClosing || !isOpen) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  }, [isClosing, isOpen]);

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    closeDropdown();
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        className="relative p-2.5 text-earth-500 dark:text-earth-400 hover:text-earth-700 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800/50 rounded-xl transition-all duration-200 active:scale-95"
      >
        <Bell className={`w-5 h-5 transition-transform ${hasNewNotification ? 'animate-bell-jiggle text-gold-600 dark:text-gold-400' : ''}`} />
        {unreadCount > 0 && (
          <span
            key={unreadCount}
            className="absolute top-2 right-2 w-2 h-2 bg-gold-500 rounded-full ring-2 ring-earth-50 dark:ring-earth-950 animate-badge-pop"
          />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 sm:w-96 card-feature z-50 overflow-hidden shadow-2xl ${isClosing ? 'animate-slide-up-out' : 'animate-slide-down'
          }`}>
          <div className="p-4 border-b border-earth-200 dark:border-earth-700/50 flex justify-between items-center bg-earth-50/80 dark:bg-earth-900/60 backdrop-blur-sm">
            <h3 className="font-semibold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs font-bold animate-badge-pop">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-earth-500 dark:text-earth-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors flex items-center gap-1 font-medium"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-earth-500 dark:text-earth-400 text-sm animate-fade-in">
                <Bell className="w-8 h-8 text-earth-300 dark:text-earth-600 mx-auto mb-2 opacity-50" />
                You're all caught up! No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-earth-100 dark:divide-earth-800/40">
                {notifications.map((notification, idx) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-earth-50 dark:hover:bg-earth-800/30 transition-colors cursor-default animate-fade-up ${!notification.isRead ? 'bg-gold-50/30 dark:bg-gold-900/5' : ''
                      }`}
                    style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'text-earth-900 dark:text-earth-100 font-medium' : 'text-earth-600 dark:text-earth-400'}`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-earth-500 dark:text-earth-500 mt-1 block">
                          {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Action buttons based on notification type */}
                        <div className="mt-3 flex gap-2">
                          {notification.relatedItemId && (
                            <Link
                              to={`/items/${notification.relatedItemId}`}
                              onClick={() => handleNotificationClick(notification)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-50 dark:bg-gold-900/20 hover:bg-gold-100 dark:hover:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs font-medium border border-gold-200 dark:border-gold-800/40 transition-colors active:scale-95"
                            >
                              View Item <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-earth-500 dark:text-earth-400 hover:text-earth-700 dark:hover:text-earth-300 px-3 py-1.5 rounded-lg bg-earth-100 dark:bg-earth-800/50 hover:bg-earth-200 dark:hover:bg-earth-700/50 transition-colors border border-earth-200 dark:border-earth-700 font-medium active:scale-95"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>

                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
