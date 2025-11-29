<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class StoreProductController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || !$user->isStoreOwner()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'ai_image_url' => ['nullable', 'string'],
        ]);

        $imagePath = null;
        
        // Handle uploaded image
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('product-images', 'public');
        }
        // Handle AI generated image URL
        elseif (!empty($validated['ai_image_url'])) {
            try {
                // Download the AI generated image with longer timeout
                $response = Http::timeout(60)
                    ->withOptions([
                        'verify' => false, // For development
                    ])
                    ->get($validated['ai_image_url']);
                
                if ($response->successful()) {
                    $imageContent = $response->body();
                    
                    // Verify it's a valid image (has content and is PNG/JPEG)
                    if (strlen($imageContent) > 1000) {
                        $fileName = 'product-images/' . Str::uuid() . '.png';
                        Storage::disk('public')->put($fileName, $imageContent);
                        $imagePath = $fileName;
                        
                        \Log::info('AI image saved successfully: ' . $fileName . ' (' . strlen($imageContent) . ' bytes)');
                    } else {
                        \Log::warning('AI image too small or empty: ' . strlen($imageContent) . ' bytes');
                    }
                } else {
                    \Log::warning('AI image download failed with status: ' . $response->status());
                }
            } catch (\Exception $e) {
                // Log error but continue without image
                \Log::error('Failed to download AI image: ' . $e->getMessage());
            }
        }

        Product::create([
            'store_id' => $store->id,
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name'] . '-' . Str::random(5)),
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'unit' => $validated['unit'] ?? 'piece',
            'image' => $imagePath,
            'is_available' => true,
            'is_featured' => false,
            'sort_order' => 0,
        ]);

        return back()->with('success', __('app.store_product_created'));
    }

    public function update(Request $request, Product $product)
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || !$user->isStoreOwner()) {
            abort(403);
        }

        // Verify product belongs to this store
        if ($product->store_id !== $store->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $data = [
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'price' => $validated['price'],
            'unit' => $validated['unit'] ?? 'piece',
            'description' => $validated['description'] ?? null,
            'is_available' => $request->boolean('is_available', true),
        ];

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->getRawOriginal('image') && Storage::disk('public')->exists($product->getRawOriginal('image'))) {
                Storage::disk('public')->delete($product->getRawOriginal('image'));
            }
            $data['image'] = $request->file('image')->store('product-images', 'public');
        }

        $product->update($data);

        return back()->with('success', __('app.store_product_updated'));
    }

    public function destroy(Request $request, Product $product)
    {
        $user = $request->user();
        $store = $user?->stores()->first();

        if (!$user || !$store || !$user->isStoreOwner()) {
            abort(403);
        }

        // Verify product belongs to this store
        if ($product->store_id !== $store->id) {
            abort(403);
        }

        // Delete product image if exists
        if ($product->getRawOriginal('image') && Storage::disk('public')->exists($product->getRawOriginal('image'))) {
            Storage::disk('public')->delete($product->getRawOriginal('image'));
        }

        $product->delete();

        return back()->with('success', __('app.store_product_deleted'));
    }
}
