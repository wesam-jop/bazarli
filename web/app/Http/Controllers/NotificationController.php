<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\PushSubscription;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->where('is_read', false);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $notifications = $query->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $this->notificationService->getUnreadCount($user->id),
        ]);
    }

    public function markAsRead(int $id)
    {
        $user = Auth::user();
        $success = $this->notificationService->markAsRead($id, $user->id);

        if ($success) {
            return redirect()->back()->with('success', __('notification_marked_read'));
        }

        return redirect()->back()->with('error', __('notification_not_found'));
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        $count = $this->notificationService->markAllAsRead($user->id);

        return redirect()->back()->with('success', __('notifications_marked_read', ['count' => $count]));
    }

    public function destroy(int $id)
    {
        $user = Auth::user();
        $success = $this->notificationService->delete($id, $user->id);

        if ($success) {
            return redirect()->back()->with('success', __('notification_deleted'));
        }

        return redirect()->back()->with('error', __('notification_not_found'));
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = Auth::user();

        // Check if subscription already exists
        $subscription = PushSubscription::where('endpoint', $request->endpoint)->first();

        if ($subscription) {
            // Update existing subscription
            $subscription->update([
                'public_key' => $request->keys['p256dh'],
                'auth_token' => $request->keys['auth'],
                'user_agent' => $request->userAgent(),
                'device_type' => 'web',
                'is_active' => true,
            ]);
        } else {
            // Create new subscription
            PushSubscription::create([
                'user_id' => $user->id,
                'endpoint' => $request->endpoint,
                'public_key' => $request->keys['p256dh'],
                'auth_token' => $request->keys['auth'],
                'user_agent' => $request->userAgent(),
                'device_type' => 'web',
                'is_active' => true,
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        $user = Auth::user();

        PushSubscription::where('user_id', $user->id)
            ->where('endpoint', $request->endpoint)
            ->update(['is_active' => false]);

        return response()->json(['success' => true]);
    }

    public function getUnreadCount()
    {
        $user = Auth::user();
        $count = $this->notificationService->getUnreadCount($user->id);

        return response()->json(['count' => $count]);
    }

    public function getRecent()
    {
        $user = Auth::user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $this->notificationService->getUnreadCount($user->id),
        ]);
    }
}
