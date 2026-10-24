<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            if (!$setting) {
                return $default;
            }

            $value = $setting->value;

            if ($setting->type === 'boolean') {
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            }
            if ($setting->type === 'number') {
                return is_numeric($value) ? (float) $value : $default;
            }
            if ($setting->type === 'json') {
                $decoded = json_decode($value ?? '[]', true);
                return json_last_error() === JSON_ERROR_NONE ? $decoded : $default;
            }

            return $value;
        });
    }

    public static function set(string $key, $value, string $type = 'text', string $group = 'general', ?string $label = null): self
    {
        if (is_bool($value)) {
            $value = $value ? '1' : '0';
            $type = 'boolean';
        } elseif (is_array($value)) {
            $value = json_encode($value);
            $type = 'json';
        } elseif (is_numeric($value) && $type !== 'text') {
            $type = 'number';
        }

        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $group,
                'label' => $label ?? $key,
            ]
        );

        Cache::forget("setting.{$key}");
        Cache::forget('settings.all');

        return $setting;
    }

    public static function getAll()
    {
        return Cache::remember('settings.all', 3600, function () {
            return self::all()->keyBy('key');
        });
    }

    public static function clearCache(): void
    {
        $settings = self::all();
        foreach ($settings as $setting) {
            Cache::forget("setting.{$setting->key}");
        }
        Cache::forget('settings.all');
    }
}
