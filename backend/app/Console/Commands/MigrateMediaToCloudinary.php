<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Services\CloudinaryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MigrateMediaToCloudinary extends Command
{
    protected $signature = 'media:cloudinary {--all : Migrate every remote image that is not already on Cloudinary}';
    protected $description = 'Copy existing remote catalogue images to Cloudinary and update their media records.';

    public function handle(CloudinaryService $cloudinary): int
    {
        if (!$this->option('all')) {
            $this->error('Pass --all to confirm migration of existing media.');
            return self::FAILURE;
        }

        if (!$cloudinary->isConfigured()) {
            $this->error('Cloudinary is not fully configured. Set the four CLOUDINARY_* values first.');
            return self::FAILURE;
        }

        $media = Media::whereNull('cloudinary_public_id')
            ->where(function ($query): void {
                $query->where('file_path', 'like', 'http://%')
                    ->orWhere('file_path', 'like', 'https://%');
            })->get();

        foreach ($media as $item) {
            $this->line("Migrating media #{$item->id}...");
            try {
                $publicId = 'catalogue-' . $item->id . '-' . Str::slug(pathinfo($item->original_name ?: 'image', PATHINFO_FILENAME));
                $source = $item->file_path;
                $temporaryPath = null;

                if ($this->isWikimediaUrl($source)) {
                    $temporaryPath = $this->downloadWikimediaImage($source);
                    $upload = $cloudinary->upload($temporaryPath, $publicId);
                } else {
                    $upload = $cloudinary->uploadRemoteUrl($source, $publicId);
                }

                $item->update([
                    'file_path' => $upload['secure_url'],
                    'cloudinary_public_id' => $upload['public_id'],
                    'size' => $upload['bytes'] ?? $item->size,
                    'mime_type' => 'image/' . ($upload['format'] ?? 'jpeg'),
                ]);
                $this->info("Migrated #{$item->id}.");
            } catch (\Throwable $exception) {
                $this->warn("Skipped #{$item->id}: {$exception->getMessage()}");
            } finally {
                if ($temporaryPath && is_file($temporaryPath)) {
                    @unlink($temporaryPath);
                }
            }

            // Respect Wikimedia rate limits between requests.
            usleep(1500000);
        }

        return self::SUCCESS;
    }

    private function isWikimediaUrl(string $url): bool
    {
        return str_contains($url, 'wikimedia.org') || str_contains($url, 'wikipedia.org');
    }

    private function downloadWikimediaImage(string $source): string
    {
        $directUrl = $source;

        // Optimize Special:FilePath by requesting 1280px web thumbnail instead of massive raw original
        if (str_contains($source, '/Special:FilePath/') && !str_contains($source, 'width=')) {
            $directUrl .= (str_contains($source, '?') ? '&' : '?') . 'width=1280';
        }

        $response = Http::withHeaders([
            'User-Agent' => 'VisitflowApp/1.0 (https://visitflow.lk; contact@visitflow.lk)',
            'Accept' => 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        ])->timeout(30)->get($directUrl);

        if ($response->failed()) {
            throw new \RuntimeException("Wikimedia download failed with HTTP {$response->status()}.");
        }

        $contentType = strtolower((string) $response->header('Content-Type'));
        if (!str_starts_with($contentType, 'image/')) {
            throw new \RuntimeException('Wikimedia returned non-image content: ' . $contentType);
        }

        $extension = str_contains($contentType, 'png') ? 'png' : (str_contains($contentType, 'webp') ? 'webp' : 'jpg');
        $path = tempnam(sys_get_temp_dir(), 'visitflow-media-') . '.' . $extension;
        file_put_contents($path, $response->body());
        return $path;
    }

    private function extractWikimediaFileTitle(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: '';
        $marker = '/Special:FilePath/';
        $position = stripos($path, $marker);
        if ($position !== false) {
            return rawurldecode(substr($path, $position + strlen($marker)));
        }

        $segments = explode('/', trim($path, '/'));
        return rawurldecode(end($segments));
    }
}
