<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'store_id',
        'delivery_driver_id',
        'status',
        'subtotal',
        'delivery_fee',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'payment_status',
        'payment_method',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'customer_phone',
        'notes',
        'estimated_delivery_time',
        'delivered_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'delivery_latitude' => 'decimal:8',
        'delivery_longitude' => 'decimal:8',
        'estimated_delivery_time' => 'integer',
        'delivered_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(uniqid());
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function deliveryDriver(): BelongsTo
    {
        return $this->belongsTo(DeliveryDriver::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * علاقة many-to-many مع المتاجر (للطلبات متعددة المتاجر)
     */
    public function stores(): BelongsToMany
    {
        return $this->belongsToMany(Store::class, 'order_stores')
            ->withPivot(['status', 'subtotal', 'delivery_fee'])
            ->withTimestamps();
    }

    /**
     * علاقة مباشرة مع order_stores pivot table
     */
    public function orderStores(): HasMany
    {
        return $this->hasMany(OrderStore::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function isDelivered()
    {
        return $this->status === 'delivered';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    public function canBeCancelled()
    {
        return in_array($this->status, [
            'pending',
            'pending_driver_approval',
            'driver_accepted',
            'store_preparing',
            'ready_for_delivery',
            'pending_store_approval',
            'confirmed',
            'preparing'
        ]);
    }

    /**
     * التحقق من أن الطلب في انتظار موافقة عامل التوصيل
     */
    public function isPendingDriverApproval()
    {
        return $this->status === 'pending_driver_approval';
    }

    /**
     * التحقق من أن عامل التوصيل قبل الطلب
     */
    public function isDriverAccepted()
    {
        return $this->status === 'driver_accepted';
    }

    /**
     * التحقق من أن المتجر يقوم بالتحضير
     */
    public function isStorePreparing()
    {
        return $this->status === 'store_preparing';
    }

    /**
     * التحقق من أن الطلب جاهز للتوصيل
     */
    public function isReadyForDelivery()
    {
        return $this->status === 'ready_for_delivery';
    }

    /**
     * التحقق من أن صاحب المتجر وافق على الطلب
     */
    public function isStoreApproved()
    {
        return $this->status === 'store_approved';
    }

    /**
     * التحقق من أن عامل التوصيل أخذ الطلب
     */
    public function isDriverPickedUp()
    {
        return $this->status === 'driver_picked_up';
    }

    /**
     * التحقق من أن الطلب مرفوض من قبل عامل التوصيل
     */
    public function isDriverRejected()
    {
        return $this->status === 'driver_rejected';
    }

    /**
     * التحقق من أن الطلب مرفوض من قبل المتجر
     */
    public function isStoreRejected()
    {
        return $this->status === 'store_rejected';
    }
}
