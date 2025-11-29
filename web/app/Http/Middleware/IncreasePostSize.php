<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IncreasePostSize
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Increase PHP limits for this request
        // Note: ini_set may not work for post_max_size and upload_max_filesize
        // These should be set in php.ini or .htaccess
        if (function_exists('ini_set')) {
            // Set max execution time to 300 seconds (5 minutes)
            @ini_set('max_execution_time', '300');
            // Set max input time
            @ini_set('max_input_time', '300');
            // Set memory limit to 256MB
            @ini_set('memory_limit', '256M');
        }

        // Check if POST data size exceeds PHP's post_max_size
        // Laravel's ValidatePostSize middleware checks this before we can override it
        // So we need to ensure PHP settings are correct in php.ini or .htaccess
        
        return $next($request);
    }
}

