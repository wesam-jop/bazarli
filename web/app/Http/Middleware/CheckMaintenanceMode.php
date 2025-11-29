<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $maintenanceMode = Setting::get('maintenance_mode', '0');
        
        // Check if maintenance mode is enabled
        if ($maintenanceMode === '1' || $maintenanceMode === true) {
            // Allow access to admin routes and login
            if ($request->is('admin/*') || $request->is('login') || $request->is('logout')) {
                // Allow admins to access admin panel even in maintenance mode
                if ($request->user() && $request->user()->isAdmin()) {
                    return $next($request);
                }
                
                // Allow access to login/logout
                return $next($request);
            }
            
            // Show maintenance page for all other routes
            $maintenanceMessage = Setting::get('maintenance_message', 'We are currently under maintenance. Please check back later.');
            
            return response()->view('maintenance', [
                'message' => $maintenanceMessage,
                'siteName' => Setting::get('site_name', 'DeliGo'),
            ], 503);
        }

        return $next($request);
    }
}

