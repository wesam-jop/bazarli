<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'latitude',
        'longitude',
        'governorate_id',
        'city_id',
        'user_type',
        'is_verified',
        'verification_code',
        'verification_code_expires_at',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'is_verified' => 'boolean',
            'verification_code_expires_at' => 'datetime',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function stores()
    {
        return $this->hasMany(Store::class, 'owner_id');
    }

    public function deliveryLocations(): HasMany
    {
        return $this->hasMany(DeliveryLocation::class);
    }

    public function favoriteProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'favorite_products')->withTimestamps();
    }

    public function driverApplication(): HasOne
    {
        return $this->hasOne(DriverApplication::class);
    }

    public function hasFavoritedProduct(int $productId): bool
    {
        return $this->favoriteProducts()
            ->where('product_id', $productId)
            ->exists();
    }

    public function adminAccess()
    {
        return $this->hasOne(AdminAccess::class);
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    // Scopes
    public function scopeCustomers($query)
    {
        return $query->where('user_type', 'customer');
    }

    public function scopeStoreOwners($query)
    {
        return $query->where('user_type', 'store_owner');
    }

    public function scopeAdmins($query)
    {
        return $query->where('user_type', 'admin');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    // Helper methods
    public function isCustomer()
    {
        return $this->user_type === 'customer';
    }

    public function isStoreOwner()
    {
        return $this->user_type === 'store_owner';
    }

    public function isAdmin()
    {
        return $this->user_type === 'admin';
    }

    public function isDriver()
    {
        return $this->user_type === 'driver';
    }

    public function isVerified()
    {
        return $this->is_verified;
    }

    public function generateVerificationCode()
    {
        $this->verification_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->verification_code_expires_at = now()->addMinutes(10);
        $this->save();
        
        return $this->verification_code;
    }

    public function verifyCode($code)
    {
        if ($this->verification_code === $code && 
            $this->verification_code_expires_at && 
            $this->verification_code_expires_at->isFuture()) {
            
            $this->is_verified = true;
            $this->verification_code = null;
            $this->verification_code_expires_at = null;
            $this->save();
            
            return true;
        }
        
        return false;
    }
}
