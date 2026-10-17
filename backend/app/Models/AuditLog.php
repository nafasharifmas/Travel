<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'actor_id',
        'action',
        'subject_type',
        'subject_id',
        'payload',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public static function record(string $action, $subject = null, ?array $payload = null, ?User $actor = null): self
    {
        $actorId = $actor ? $actor->id : (auth()->id() ?? null);
        $subjectType = $subject ? get_class($subject) : null;
        $subjectId = $subject && isset($subject->id) ? $subject->id : null;

        return self::create([
            'actor_id' => $actorId,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'payload' => $payload,
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }
}

