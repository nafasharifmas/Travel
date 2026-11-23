<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CloudinaryService
{
    public function isConfigured(): bool
    {
        return (bool) config('cloudinary.enabled')
            && filled(config('cloudinary.cloud_name'))
            && filled(config('cloudinary.api_key'))
            && filled(config('cloudinary.api_secret'));
    }

    /** @return array{secure_url:string,public_id:string,bytes:int,format:string} */
    public function upload(UploadedFile|string $file, string $publicId): array
    {
        $this->ensureConfigured();

        $timestamp = now()->timestamp;
        $params = [
            'folder' => config('cloudinary.folder'),
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];

        $signature = sha1($this->canonicalize($params) . config('cloudinary.api_secret'));
        $contents = $file instanceof UploadedFile ? $file->get() : file_get_contents($file);
        $filename = $file instanceof UploadedFile ? $file->getClientOriginalName() : basename($file);

        $request = Http::asMultipart()
            ->timeout(60)
            ->attach('file', $contents, $filename);

        $formData = [
            ...$params,
            'api_key' => config('cloudinary.api_key'),
            'signature' => $signature,
        ];

        foreach ($formData as $key => $value) {
            $request->attach($key, (string) $value);
        }

        $response = $request->post($this->endpoint('image/upload'));

        if ($response->failed()) {
            throw new RuntimeException('Cloudinary upload failed: ' . $response->json('error.message', 'unknown error'));
        }

        return $response->json();
    }

    /** @return array{secure_url:string,public_id:string,bytes:int,format:string} */
    public function uploadRemoteUrl(string $url, string $publicId): array
    {
        $this->ensureConfigured();

        $timestamp = now()->timestamp;
        $params = [
            'folder' => config('cloudinary.folder'),
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];
        $signature = sha1($this->canonicalize($params) . config('cloudinary.api_secret'));

        $response = Http::asForm()->timeout(120)->post($this->endpoint('image/upload'), [
            ...$params,
            'file' => $url,
            'api_key' => config('cloudinary.api_key'),
            'signature' => $signature,
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Cloudinary remote upload failed: ' . $response->json('error.message', 'unknown error'));
        }

        return $response->json();
    }

    public function destroy(string $publicId): void
    {
        $this->ensureConfigured();

        $timestamp = now()->timestamp;
        $params = ['public_id' => $publicId, 'timestamp' => $timestamp];
        $signature = sha1($this->canonicalize($params) . config('cloudinary.api_secret'));

        $response = Http::asForm()->timeout(60)->post($this->endpoint('image/destroy'), [
            ...$params,
            'api_key' => config('cloudinary.api_key'),
            'signature' => $signature,
        ]);

        if ($response->failed() || $response->json('result') === 'error') {
            throw new RuntimeException('Cloudinary deletion failed.');
        }
    }

    private function endpoint(string $action): string
    {
        return 'https://api.cloudinary.com/v1_1/' . config('cloudinary.cloud_name') . '/' . $action;
    }

    private function canonicalize(array $params): string
    {
        ksort($params);
        return collect($params)->map(fn ($value, $key) => $key . '=' . $value)->implode('&');
    }

    private function ensureConfigured(): void
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('Cloudinary is not fully configured. Set CLOUDINARY_ENABLED, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
        }
    }
}
