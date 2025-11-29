<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\DriverWorkingHour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DriverWorkingHoursController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            abort(403);
        }

        // Get or create working hours for all days
        $daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        $workingHours = [];
        foreach ($daysOfWeek as $day) {
            $workingHour = DriverWorkingHour::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'day_of_week' => $day,
                ],
                [
                    'opening_time' => '09:00',
                    'closing_time' => '17:00',
                    'is_closed' => false,
                ]
            );
            $workingHours[] = $workingHour;
        }

        return Inertia::render('Dashboard/DriverWorkingHours', [
            'driver' => $user,
            'workingHours' => $workingHours,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            abort(403);
        }

        $request->validate([
            'working_hours' => 'required|array|size:7',
            'working_hours.*.day_of_week' => 'required|in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'working_hours.*.is_closed' => 'required|boolean',
            'working_hours.*.opening_time' => 'nullable|required_if:working_hours.*.is_closed,false|date_format:H:i',
            'working_hours.*.closing_time' => 'nullable|required_if:working_hours.*.is_closed,false|date_format:H:i|after:working_hours.*.opening_time',
        ], [
            'working_hours.*.opening_time.required_if' => __('Opening time is required when the day is not closed.'),
            'working_hours.*.closing_time.required_if' => __('Closing time is required when the day is not closed.'),
            'working_hours.*.closing_time.after' => __('Closing time must be after opening time.'),
        ]);

        foreach ($request->working_hours as $workingHourData) {
            DriverWorkingHour::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'day_of_week' => $workingHourData['day_of_week'],
                ],
                [
                    'opening_time' => $workingHourData['is_closed'] ? null : $workingHourData['opening_time'],
                    'closing_time' => $workingHourData['is_closed'] ? null : $workingHourData['closing_time'],
                    'is_closed' => $workingHourData['is_closed'],
                ]
            );
        }

        return redirect()->back()->with('success', __('working_hours_updated'));
    }
}
