import React, { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { requestNotificationPermission, subscribeToPushNotifications } from '../utils/pushNotifications';

export default function NotificationPermissionPrompt({ vapidPublicKey, onDismiss }) {
    const [show, setShow] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [status, setStatus] = useState(null); // 'granted', 'denied', 'default'

    useEffect(() => {
        // Check if permission is already granted or denied
        if ('Notification' in window) {
            const permission = Notification.permission;
            setStatus(permission);

            // Only show prompt if permission is 'default' (not asked yet)
            if (permission === 'default' && vapidPublicKey) {
                // Show prompt after a short delay to not interrupt user
                const timer = setTimeout(() => {
                    setShow(true);
                }, 2000); // Show after 2 seconds

                return () => clearTimeout(timer);
            }
        }
    }, [vapidPublicKey]);

    const handleEnable = async () => {
        if (!vapidPublicKey) {
            return;
        }

        setIsRequesting(true);
        try {
            const granted = await requestNotificationPermission();
            if (granted) {
                // Subscribe to push notifications
                await subscribeToPushNotifications(vapidPublicKey);
                setStatus('granted');
                setShow(false);
                if (onDismiss) onDismiss(true);
            } else {
                setStatus('denied');
                setShow(false);
                if (onDismiss) onDismiss(false);
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            setStatus('denied');
            setShow(false);
            if (onDismiss) onDismiss(false);
        } finally {
            setIsRequesting(false);
        }
    };

    const handleDismiss = () => {
        setShow(false);
        if (onDismiss) onDismiss(false);
        // Store dismissal in localStorage to not show again for this session
        localStorage.setItem('notification_prompt_dismissed', 'true');
    };

    // Don't show if already dismissed in this session
    useEffect(() => {
        if (localStorage.getItem('notification_prompt_dismissed') === 'true') {
            setShow(false);
        }
    }, []);

    if (!show || status !== 'default' || !vapidPublicKey) {
        return null;
    }

    // Check if RTL
    const isRTL = document.documentElement.dir === 'rtl' || document.documentElement.getAttribute('lang') === 'ar';

    return (
        <div className={`fixed bottom-4 z-50 max-w-sm animate-slide-up ${isRTL ? 'left-4' : 'right-4'}`}>
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-accent-600 rounded-xl flex items-center justify-center">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            تفعيل الإشعارات
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                            احصل على إشعارات فورية حول طلباتك، العروض الخاصة، والتحديثات المهمة
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEnable}
                                disabled={isRequesting}
                                className="flex-1 bg-accent-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isRequesting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>جاري التفعيل...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>تفعيل الإشعارات</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="إغلاق"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

