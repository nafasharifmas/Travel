<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::orderBy('group')->orderBy('id')->get();

        $grouped = $settings->groupBy('group')->map(function ($items, $group) {
            return $items->map(function ($setting) {
                $value = $setting->value;

                if ($setting->type === 'boolean') {
                    $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                } elseif ($setting->type === 'number') {
                    $value = is_numeric($value) ? (float) $value : null;
                } elseif ($setting->type === 'json') {
                    $decoded = json_decode($value ?? '[]', true);
                    $value = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
                }

                // Mask sensitive fields
                if (in_array($setting->key, ['mail_password'])) {
                    $value = !empty($value) ? '••••••••' : '';
                }

                return [
                    'key' => $setting->key,
                    'value' => $value,
                    'type' => $setting->type,
                    'group' => $setting->group,
                    'label' => $setting->label,
                    'description' => $setting->description,
                ];
            })->values();
        });

        // System info
        $systemInfo = [
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'environment' => app()->environment(),
            'app_url' => config('app.url'),
            'db_connection' => config('database.default'),
        ];

        return response()->json([
            'settings' => $grouped,
            'system_info' => $systemInfo,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->input('settings', []);

        foreach ($data as $key => $value) {
            $setting = Setting::where('key', $key)->first();
            if (!$setting) {
                continue;
            }

            // Don't update masked password if it's still masked
            if ($key === 'mail_password' && $value === '••••••••') {
                continue;
            }

            if ($setting->type === 'boolean') {
                Setting::set($key, (bool) $value, 'boolean', $setting->group, $setting->label);
            } elseif ($setting->type === 'number') {
                Setting::set($key, $value, 'number', $setting->group, $setting->label);
            } elseif ($setting->type === 'json') {
                Setting::set($key, $value, 'json', $setting->group, $setting->label);
            } else {
                Setting::set($key, $value, 'text', $setting->group, $setting->label);
            }
        }

        Setting::clearCache();

        return response()->json([
            'message' => 'Settings updated successfully.',
        ]);
    }
}
