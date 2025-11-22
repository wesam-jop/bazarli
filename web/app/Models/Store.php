<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    protected $fillable = [
        'owner_id',
        'name',
        'code',
        'store_type',
        'logo_path',
        'address',
        'latitude',
        'longitude',
        'governorate_id',
        'city_id',
        'phone',
        'email',
        'opening_time',
        'closing_time',
        'is_active',
        'delivery_radius',
        'delivery_fee',
        'estimated_delivery_time',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'delivery_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'opening_time' => 'datetime:H:i',
        'closing_time' => 'datetime:H:i',
    ];

    protected $appends = [
        'store_type_label',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * علاقة many-to-many مع الطلبات (للطلبات متعددة المتاجر)
     */
    public function orderStores(): HasMany
    {
        return $this->hasMany(OrderStore::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function storeType(): BelongsTo
    {
        return $this->belongsTo(StoreType::class, 'store_type', 'key');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isWithinDeliveryRadius($latitude, $longitude)
    {
        $distance = $this->calculateDistance($latitude, $longitude);
        return $distance <= $this->delivery_radius;
    }

    public function calculateDistance($latitude, $longitude)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $latDiff = deg2rad($latitude - $this->latitude);
        $lonDiff = deg2rad($longitude - $this->longitude);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($this->latitude)) * cos(deg2rad($latitude)) *
             sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function getStoreTypeLabelAttribute(): ?string
    {
        if (!$this->store_type) {
            return null;
        }

        $storeType = $this->relationLoaded('storeType')
            ? $this->storeType
            : $this->storeType()->first();

        if (!$storeType) {
            return $this->store_type;
        }

        return app()->getLocale() === 'ar' ? $storeType->name_ar : $storeType->name_en;
    }
}
