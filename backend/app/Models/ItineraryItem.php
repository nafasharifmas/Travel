<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItineraryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'itinerary_id',
        'place_id',
        'day_no',
        'sequence_order',
        'visit_time',
        'notes',
    ];

    protected $casts = [
        'day_no' => 'integer',
        'sequence_order' => 'integer',
    ];

    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class)->withTrashed();
    }
}

