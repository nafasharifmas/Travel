<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaController extends Controller
{
    /**
     * Stream uploaded place photograph with proper mime headers and caching.
     */
    public function show(int $id)
    {
        $media = Media::findOrFail($id);

        if (str_starts_with($media->file_path, 'http://') || str_starts_with($media->file_path, 'https://')) {
            return redirect($media->file_path);
        }

        if (!Storage::disk('local')->exists($media->file_path)) {
            return response()->json(['message' => 'Image file not found on server.'], 404);
        }

        $fileContent = Storage::disk('local')->get($media->file_path);
        $mime = $media->mime_type ?? Storage::disk('local')->mimeType($media->file_path) ?? 'image/jpeg';

        return response($fileContent, 200, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}

