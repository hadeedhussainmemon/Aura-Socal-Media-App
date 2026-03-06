"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

type Notification = {
  id: string;
  _id?: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_avatar?: string;
  avatar?: string;
  action_url?: string;
  read?: boolean;
  created_at: string;
  user?: { id: string; name: string; username: string; image_url?: string };
};

const NotificationBell = ({ inlineLabel }: { inlineLabel?: string }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications with debug log
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id || (user as { _id?: string })._id}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data || []);
          setUnreadCount((data || []).filter((n: Notification) => !n.read).length);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };
    fetchNotifications();

    // Fallback polling for notifications interval
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleBellClick = async () => {
    const newDropdownState = !showDropdown;
    setShowDropdown(newDropdownState);

    if (newDropdownState && user) {
      // Mark all as read
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id || n._id);
      if (unreadIds.length > 0) {
        try {
          await fetch(`/api/users/${user.id || (user as { _id?: string })._id}/notifications/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: unreadIds })
          });
          // Update local state to reflect read status
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
          console.error(error);
        }
      }
      setUnreadCount(0);
    }
  };

  return (
    <div className={`relative ${inlineLabel ? 'w-full' : ''}`}>
      {/* Modern Bell Button */}
      <motion.button
        className={`relative rounded-xl transition-all duration-200 group flex items-center gap-4 ${inlineLabel
          ? 'w-full p-3 hover:bg-white/5 active:scale-[0.98]'
          : 'p-3 bg-dark-3/50 hover:bg-dark-2/70 border border-dark-4/50 hover:border-dark-4'
          }`}
        onClick={handleBellClick}
        whileHover={!inlineLabel ? { scale: 1.05 } : {}}
        whileTap={{ scale: 0.95 }}
      >
        {/* Bell Icon with Animation */}
        <div className="relative">
          <motion.div
            animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-light-2 group-hover:text-light-1 transition-colors"
            >
              <path
                d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          {/* Modern Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`absolute -top-1 -right-1 flex items-center justify-center ${inlineLabel ? 'scale-75 origin-top-right' : ''}`}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500 rounded-full"
                />
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border border-dark-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {inlineLabel && (
          <p className="small-medium text-light-2 group-hover:text-light-1 transition-colors">
            {inlineLabel}
          </p>
        )}

        {/* Hover Glow Effect */}
        {!inlineLabel && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/10 group-hover:to-primary-600/10 transition-all duration-300" />
        )}
      </motion.button>

      {/* Modern Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-80 max-w-[calc(100vw-2rem)] bg-dark-2/95 backdrop-blur-lg border border-dark-4/50 rounded-2xl shadow-2xl z-50 overflow-hidden 
              fixed top-20 left-[15%] -translate-x-1/2
              sm:absolute sm:top-full sm:mt-2 sm:left-0 sm:right-auto sm:translate-x-0"
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-4/50 bg-gradient-to-r from-dark-2 to-dark-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-light-1 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Notifications
                </h3>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                    {notifications.filter(n => !n.read).length} new
                  </span>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-dark-3 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-light-4">
                        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-light-3 text-sm">No notifications yet</p>
                      <p className="text-light-4 text-xs mt-1">We&apos;ll notify you when something happens!</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="divide-y divide-dark-4/30">
                  {notifications.map((n: Notification, index: number) => (
                    <motion.div
                      key={n.id || n._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-dark-3/30 transition-colors cursor-pointer ${!n.read ? 'bg-primary-500/5 border-l-2 border-l-primary-500' : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <Image
                            src={n.user?.image_url || "/assets/icons/profile-placeholder.svg"}
                            alt={n.user?.username || "User"}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-dark-4"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-light-1">
                            {n.user?.username && (
                              <span className="font-semibold text-primary-400">{n.user.username}</span>
                            )}
                            {n.user?.username ? ' ' : ''}
                            <span className="text-light-2">{n.message}</span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-light-4">
                              {new Date(n.created_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {!n.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer (if needed) */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-dark-4/50 bg-dark-3/30">
                <button
                  className="w-full text-xs text-light-3 hover:text-light-1 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Close notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
