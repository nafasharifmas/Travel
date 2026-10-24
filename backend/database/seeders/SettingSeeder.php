<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // General
            ['key' => 'app_name', 'value' => 'VisitFlow', 'type' => 'text', 'group' => 'general', 'label' => 'Application Name', 'description' => 'Name displayed across the site'],
            ['key' => 'app_tagline', 'value' => 'Discover Sri Lanka\'s Eastern Corridor', 'type' => 'text', 'group' => 'general', 'label' => 'Tagline', 'description' => 'Site tagline'],
            ['key' => 'contact_email', 'value' => 'info@visitflow.lk', 'type' => 'text', 'group' => 'general', 'label' => 'Contact Email', 'description' => 'Primary contact email'],
            ['key' => 'support_number', 'value' => '+94 11 234 5678', 'type' => 'text', 'group' => 'general', 'label' => 'Support Number', 'description' => 'Support phone number'],
            ['key' => 'footer_text', 'value' => '© 2026 VisitFlow. All rights reserved.', 'type' => 'text', 'group' => 'general', 'label' => 'Footer Text', 'description' => 'Footer copyright text'],

            // Map & Location
            ['key' => 'map_ref_lat', 'value' => '7.439374', 'type' => 'number', 'group' => 'map', 'label' => 'Reference Latitude', 'description' => 'Center point for distance calculation'],
            ['key' => 'map_ref_lng', 'value' => '81.817172', 'type' => 'number', 'group' => 'map', 'label' => 'Reference Longitude', 'description' => 'Center point for distance calculation'],
            ['key' => 'map_radius_km', 'value' => '25', 'type' => 'number', 'group' => 'map', 'label' => 'Radius (KM)', 'description' => 'Maximum distance from reference point'],
            ['key' => 'map_default_zoom', 'value' => '14', 'type' => 'number', 'group' => 'map', 'label' => 'Default Map Zoom', 'description' => 'Default zoom level for maps'],
            ['key' => 'enable_map_bounds', 'value' => '1', 'type' => 'boolean', 'group' => 'map', 'label' => 'Enable Map Bounds Restriction', 'description' => 'Restrict places to within radius'],

            // Security
            ['key' => 'force_logout_on_role_change', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'label' => 'Force Logout on Role Change', 'description' => 'Force logout when user role is changed'],
            ['key' => 'allow_user_deactivation', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'label' => 'Allow User Deactivation', 'description' => 'Allow admins to deactivate users'],
            ['key' => 'audit_logs_admin_only', 'value' => '1', 'type' => 'boolean', 'group' => 'security', 'label' => 'Audit Logs Admin Only', 'description' => 'Restrict audit logs to admins'],
            ['key' => 'session_timeout_minutes', 'value' => '120', 'type' => 'number', 'group' => 'security', 'label' => 'Session Timeout (Minutes)', 'description' => 'Session timeout duration'],

            // Catalogue
            ['key' => 'auto_approve_places', 'value' => '1', 'type' => 'boolean', 'group' => 'catalogue', 'label' => 'Auto-approve New Places', 'description' => 'Automatically approve newly created places'],
            ['key' => 'require_images_publish', 'value' => '0', 'type' => 'boolean', 'group' => 'catalogue', 'label' => 'Require Images on Publish', 'description' => 'Require at least one image to publish'],
            ['key' => 'show_archived_admin_default', 'value' => '1', 'type' => 'boolean', 'group' => 'catalogue', 'label' => 'Show Archived in Admin by Default', 'description' => 'Show archived places by default in admin'],

            // Media & Storage
            ['key' => 'storage_driver', 'value' => 'local', 'type' => 'text', 'group' => 'media', 'label' => 'Storage Driver', 'description' => 'Storage driver (local or cloudinary)'],
            ['key' => 'max_upload_size_mb', 'value' => '5', 'type' => 'number', 'group' => 'media', 'label' => 'Max Upload Size (MB)', 'description' => 'Maximum upload file size'],
            ['key' => 'allowed_extensions', 'value' => json_encode(['jpg', 'jpeg', 'png', 'webp']), 'type' => 'json', 'group' => 'media', 'label' => 'Allowed Extensions', 'description' => 'Allowed image extensions'],
            ['key' => 'auto_generate_thumbnails', 'value' => '0', 'type' => 'boolean', 'group' => 'media', 'label' => 'Auto-generate Thumbnails', 'description' => 'Generate thumbnails automatically'],

            // Email
            ['key' => 'mail_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'email', 'label' => 'Enable SMTP', 'description' => 'Enable email sending'],
            ['key' => 'mail_host', 'value' => 'smtp.mailtrap.io', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Host', 'description' => 'SMTP host'],
            ['key' => 'mail_port', 'value' => '2525', 'type' => 'number', 'group' => 'email', 'label' => 'Mail Port', 'description' => 'SMTP port'],
            ['key' => 'mail_username', 'value' => '', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Username', 'description' => 'SMTP username'],
            ['key' => 'mail_password', 'value' => '', 'type' => 'text', 'group' => 'email', 'label' => 'Mail Password', 'description' => 'SMTP password'],
            ['key' => 'mail_from_address', 'value' => 'noreply@visitflow.lk', 'type' => 'text', 'group' => 'email', 'label' => 'From Address', 'description' => 'Sender email address'],
            ['key' => 'mail_from_name', 'value' => 'VisitFlow', 'type' => 'text', 'group' => 'email', 'label' => 'From Name', 'description' => 'Sender name'],

            // Appearance
            ['key' => 'logo_url', 'value' => '/visitflow-logo.png', 'type' => 'text', 'group' => 'appearance', 'label' => 'Logo URL', 'description' => 'Site logo URL'],
            ['key' => 'favicon_url', 'value' => '/favicon.ico', 'type' => 'text', 'group' => 'appearance', 'label' => 'Favicon URL', 'description' => 'Favicon URL'],
            ['key' => 'primary_color', 'value' => '#0FAF8F', 'type' => 'text', 'group' => 'appearance', 'label' => 'Primary Color', 'description' => 'Primary brand color'],
            ['key' => 'accent_color', 'value' => '#E7B94C', 'type' => 'text', 'group' => 'appearance', 'label' => 'Accent Color', 'description' => 'Accent brand color'],
        ];

        foreach ($defaults as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
