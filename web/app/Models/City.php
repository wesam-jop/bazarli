<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'governorate_id',
        'name_ar',
        'name_en',
        'center_latitude',
        'center_longitude',
        'delivery_radius',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'center_latitude' => 'decimal:8',
        'center_longitude' => 'decimal:8',
        'delivery_radius' => 'integer',
        'is_active' => 'boolean',
    ];

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class);
    }

    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByGovernorate($query, $governorateId)
    {
        return $query->where('governorate_id', $governorateId);
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->name_ar : $this->name_en;
    }

    /**
     * التحقق من أن موقع معين ضمن نطاق هذه المنطقة
     */
    public function isLocationWithinRadius($latitude, $longitude): bool
    {
        if (!$this->center_latitude || !$this->center_longitude) {
            return false;
        }

        $distance = $this->calculateDistance(
            $this->center_latitude,
            $this->center_longitude,
            $latitude,
            $longitude
        );

        return $distance <= $this->delivery_radius;
    }

    /**
     * حساب المسافة بين نقطتين بالكيلومتر
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371; // نصف قطر الأرض بالكيلومتر

        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
