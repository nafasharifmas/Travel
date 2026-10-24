<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Place extends Model
{
    use HasFactory, SoftDeletes;

    public const REFERENCE_LAT = 7.439374;
    public const REFERENCE_LNG = 81.817172;
    public const LOCAL_RADIUS_KM = 25;

    public function scopeWithinLocalArea(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        // Clamp floating-point error before ACOS; never round before filtering.
        return $query->whereRaw(
            '6371 * ACOS(LEAST(1, GREATEST(-1, COS(RADIANS(?)) * COS(RADIANS(lat)) * COS(RADIANS(lng) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(lat))))) <= ?',
            [self::REFERENCE_LAT, self::REFERENCE_LNG, self::REFERENCE_LAT, self::LOCAL_RADIUS_KM]
        );
    }

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'travel_tips',
        'address',
        'lat',
        'lng',
        'opening_hours',
        'contact_info',
        'created_by',
        'is_active',
    ];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function media()
    {
        return $this->hasMany(Media::class)->orderBy('sort_order')->orderBy('id');
    }

    public function primaryMedia()
    {
        return $this->hasOne(Media::class)->where('is_primary', true);
    }

    public function itineraryItems()
    {
        return $this->hasMany(ItineraryItem::class);
    }
}

