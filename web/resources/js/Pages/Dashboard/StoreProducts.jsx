import React, { useState } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import StoreLayout from './StoreLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useGeneralSettings } from '../../hooks/useGeneralSettings';
import { Upload, Package, DollarSign, Plus, ChevronDown, Scale, Sparkles, Loader2, X, Pencil, Trash2, Check } from 'lucide-react';

export default function StoreProducts({ store, productCategories, products, productUnits }) {
    const { flash } = usePage().props;
    const { t, locale } = useTranslation();
    const isRTL = locale === 'ar';
    const { formatCurrency, formatDate } = useGeneralSettings();

    // AI Image Generation State
    const [showAiGenerator, setShowAiGenerator] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    // Edit Modal State
    const [editingProduct, setEditingProduct] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    
    // Delete Confirm State
    const [deletingProduct, setDeletingProduct] = useState(null);

    const form = useForm({
        name: '',
        category_id: productCategories[0]?.id || '',
        price: '',
        unit: 'piece',
        description: '',
        image: null,
        ai_image_url: '',
    });

    const editForm = useForm({
        name: '',
        category_id: '',
        price: '',
        unit: 'piece',
        description: '',
        image: null,
        is_available: true,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post('/dashboard/store/products', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('name', 'price', 'unit', 'description', 'image', 'ai_image_url');
                setImagePreview(null);
                setGeneratedImageUrl('');
                setAiPrompt('');
            },
        });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            form.setData('image', file);
            form.setData('ai_image_url', '');
            setImagePreview(URL.createObjectURL(file));
            setGeneratedImageUrl('');
        }
    };

    // Comprehensive Arabic to English product translations
    const translateArabicToEnglish = (text) => {
        const translations = {
            // الخضار والفواكه
            'بيض': 'fresh eggs in carton',
            'خبز': 'fresh baked bread loaf',
            'حليب': 'milk bottle dairy',
            'لبن': 'yogurt dairy product',
            'جبنة': 'cheese block',
            'جبن': 'cheese',
            'زبدة': 'butter block',
            'قشطة': 'cream dairy',
            'سكر': 'white sugar in bowl',
            'ملح': 'salt shaker',
            'رز': 'white rice grains in bag',
            'أرز': 'rice grains',
            'زيت': 'cooking oil bottle',
            'زيتون': 'olives green olives',
            'طماطم': 'fresh red tomatoes',
            'بندورة': 'tomatoes',
            'خيار': 'fresh green cucumbers',
            'بطاطا': 'fresh potatoes',
            'بطاطس': 'potatoes',
            'بصل': 'onions',
            'ثوم': 'garlic bulbs',
            'فلفل': 'bell peppers',
            'جزر': 'carrots',
            'خس': 'lettuce',
            'سبانخ': 'spinach leaves',
            'بقدونس': 'parsley herbs',
            'نعناع': 'mint leaves',
            'تفاح': 'fresh red apples',
            'موز': 'yellow bananas',
            'برتقال': 'fresh oranges',
            'ليمون': 'lemons citrus',
            'عنب': 'grapes',
            'فراولة': 'strawberries',
            'بطيخ': 'watermelon',
            'شمام': 'cantaloupe melon',
            'مانجو': 'mango fruit',
            'أناناس': 'pineapple',
            'كيوي': 'kiwi fruit',
            'رمان': 'pomegranate',
            'تين': 'figs',
            'تمر': 'dates dried fruit',
            // المشروبات
            'عصير': 'juice bottle',
            'ماء': 'water bottle',
            'مياه': 'mineral water bottle',
            'شاي': 'tea box package',
            'قهوة': 'coffee beans package',
            'نسكافيه': 'instant coffee jar',
            'كولا': 'cola soda bottle',
            'بيبسي': 'pepsi cola bottle',
            'سفن اب': 'sprite lemon soda',
            // اللحوم
            'لحم': 'fresh raw meat beef',
            'لحمة': 'meat cuts',
            'دجاج': 'whole fresh chicken',
            'فروج': 'chicken',
            'سمك': 'fresh fish',
            'سلمون': 'salmon fish',
            'تونا': 'tuna fish can',
            'روبيان': 'shrimp seafood',
            'جمبري': 'prawns shrimp',
            // المخبوزات والحلويات
            'كيك': 'cake dessert',
            'كعك': 'cookies biscuits',
            'بسكويت': 'biscuits cookies',
            'شوكولاته': 'chocolate bar',
            'شوكولا': 'chocolate',
            'حلاوة': 'halva sweets',
            'حلويات': 'assorted sweets desserts',
            'معجنات': 'fresh baked pastries',
            'كرواسون': 'croissant pastry',
            'دونات': 'donuts',
            'آيس كريم': 'ice cream',
            'بوظة': 'ice cream',
            // المكسرات والبقوليات
            'مكسرات': 'mixed nuts',
            'فستق': 'pistachios nuts',
            'لوز': 'almonds',
            'جوز': 'walnuts',
            'كاجو': 'cashews',
            'فول': 'fava beans',
            'حمص': 'chickpeas hummus',
            'عدس': 'lentils',
            'فاصوليا': 'beans',
            // التوابل
            'بهارات': 'mixed spices',
            'كمون': 'cumin spice',
            'كركم': 'turmeric spice',
            'زعتر': 'thyme herbs',
            'قرفة': 'cinnamon sticks',
            'هيل': 'cardamom spice',
            // المعلبات
            'معلبات': 'canned food',
            'طون': 'canned tuna',
            'فول معلب': 'canned beans',
            'ذرة': 'corn canned',
            'صلصة': 'tomato sauce',
            'كاتشب': 'ketchup bottle',
            'مايونيز': 'mayonnaise jar',
            'خردل': 'mustard',
            'عسل': 'honey jar golden',
            'مربى': 'jam jar',
            // المنظفات
            'صابون': 'soap bar',
            'شامبو': 'shampoo bottle',
            'بلسم': 'hair conditioner',
            'معجون أسنان': 'toothpaste tube',
            'معجون': 'toothpaste',
            'فرشاة أسنان': 'toothbrush',
            'منظف': 'cleaning product bottle',
            'مسحوق غسيل': 'laundry detergent',
            'صابون سائل': 'liquid soap',
            'معقم': 'sanitizer bottle',
            'مناديل': 'tissues box',
            'ورق تواليت': 'toilet paper rolls',
            // عام
            'طازج': 'fresh',
            'طازجة': 'fresh',
            'عضوي': 'organic',
            'طبيعي': 'natural',
            'منتج': 'product',
            'علبة': 'box package',
            'كيس': 'bag package',
            'زجاجة': 'bottle',
            'عبوة': 'container package',
        };

        let result = text;
        let englishTerms = [];
        
        // Sort by length (longest first) to match longer phrases first
        const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
        
        for (const arabic of sortedKeys) {
            if (text.includes(arabic)) {
                englishTerms.push(translations[arabic]);
            }
        }
        
        return englishTerms.length > 0 ? englishTerms.join(', ') : text;
    };

    // Generate AI Image using multiple providers with fallback
    const generateAiImage = async () => {
        if (!aiPrompt.trim()) return;
        
        setIsGenerating(true);
        
        try {
            const userPrompt = aiPrompt.trim();
            const isArabic = /[\u0600-\u06FF]/.test(userPrompt);
            
            // Translate Arabic to English for better AI understanding
            let productDescription = isArabic ? translateArabicToEnglish(userPrompt) : userPrompt;
            
            // Professional product photography prompt
            const finalPrompt = `A single ${productDescription} product, professional product photography, studio lighting, pure white background, centered composition, high resolution, commercial photography style, sharp focus, no text, no watermarks, no logos, photorealistic`;
            
            console.log('Generating image with prompt:', finalPrompt);
            
            // Try primary provider: Together AI compatible endpoint via Pollinations
            let imageBlob = null;
            let success = false;
            
            // Method 1: Pollinations with flux-realism model (best for products)
            try {
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&model=flux-realism&nologo=true&seed=${Date.now()}`;
                
                const response = await fetch(pollinationsUrl);
                if (response.ok) {
                    imageBlob = await response.blob();
                    if (imageBlob.size > 10000) {
                        success = true;
                        console.log('Success with flux-realism model');
                    }
                }
            } catch (e) {
                console.log('Pollinations flux-realism failed, trying next...');
            }
            
            // Method 2: Fallback to turbo model
            if (!success) {
                try {
                    const turboUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&model=turbo&nologo=true&seed=${Date.now()}`;
                    
                    const response = await fetch(turboUrl);
                    if (response.ok) {
                        imageBlob = await response.blob();
                        if (imageBlob.size > 10000) {
                            success = true;
                            console.log('Success with turbo model');
                        }
                    }
                } catch (e) {
                    console.log('Turbo model failed, trying next...');
                }
            }
            
            // Method 3: Fallback to default flux
            if (!success) {
                try {
                    const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&model=flux&nologo=true&enhance=true&seed=${Date.now()}`;
                    
                    const response = await fetch(fluxUrl);
                    if (response.ok) {
                        imageBlob = await response.blob();
                        if (imageBlob.size > 5000) {
                            success = true;
                            console.log('Success with flux model');
                        }
                    }
                } catch (e) {
                    console.log('Flux model failed');
                }
            }
            
            if (!success || !imageBlob) {
                throw new Error('All image generation methods failed');
            }
            
            const file = new File([imageBlob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
            const previewUrl = URL.createObjectURL(imageBlob);
            
            setGeneratedImageUrl(previewUrl);
            setImagePreview(previewUrl);
            form.setData('image', file);
            form.setData('ai_image_url', '');
            setIsGenerating(false);
            
        } catch (error) {
            console.error('Error generating image:', error);
            setIsGenerating(false);
            alert(t('ai_image_error') || 'حدث خطأ أثناء توليد الصورة. حاول وصف المنتج بكلمات مختلفة أو باللغة الإنجليزية.');
        }
    };

    // Get unit label
    const getUnitLabel = (unitValue) => {
        const unit = productUnits?.find(u => u.value === unitValue);
        return unit?.label || unitValue;
    };

    // Clear image
    const clearImage = () => {
        form.setData('image', null);
        form.setData('ai_image_url', '');
        setImagePreview(null);
        setGeneratedImageUrl('');
    };

    // Open Edit Modal
    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditImagePreview(product.image || null);
        editForm.setData({
            name: product.name,
            category_id: product.category_id || productCategories[0]?.id || '',
            price: product.price,
            unit: product.unit || 'piece',
            description: product.description || '',
            image: null,
            is_available: product.is_available,
        });
    };

    // Close Edit Modal
    const closeEditModal = () => {
        setEditingProduct(null);
        setEditImagePreview(null);
        editForm.reset();
    };

    // Handle Edit Image Change
    const handleEditImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            editForm.setData('image', file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    // Submit Edit
    const handleEditSubmit = (event) => {
        event.preventDefault();
        editForm.post(`/dashboard/store/products/${editingProduct.id}`, {
            method: 'put',
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    // Delete Product
    const handleDelete = () => {
        router.delete(`/dashboard/store/products/${deletingProduct.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingProduct(null);
            },
        });
    };

    return (
        <StoreLayout title={t('store_products_manage_title') || 'Manage Products'}>
            <Head title={t('store_products_manage_title') || 'Manage Products'} />

            <div className="space-y-6">
                {/* Flash Messages */}
                {(flash?.success || flash?.error) && (
                    <div
                        className={`rounded-xl border p-4 text-sm text-start ${
                            flash.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                    >
                        {flash.success || flash.error}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Add Product Form */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                        <div className="text-start">
                            <h3 className="text-lg font-semibold text-slate-900">{t('store_products_section_title')}</h3>
                            <p className="text-sm text-slate-500">{t('store_products_section_subtitle')}</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Name & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_name_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                            <Package className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            placeholder={t('store_product_name_placeholder')}
                                            className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    {form.errors.name && <p className="mt-1.5 text-xs text-rose-600 text-start">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_category_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={form.data.category_id}
                                            onChange={(e) => form.setData('category_id', e.target.value)}
                                            className="w-full px-4 py-3 pe-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                        >
                                            {productCategories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {form.errors.category_id && <p className="mt-1.5 text-xs text-rose-600 text-start">{form.errors.category_id}</p>}
                                </div>
                            </div>

                            {/* Price & Unit */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_price_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                            <DollarSign className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            dir="ltr"
                                            value={form.data.price}
                                            onChange={(e) => form.setData('price', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full ps-12 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white text-left transition-all"
                                        />
                                    </div>
                                    {form.errors.price && <p className="mt-1.5 text-xs text-rose-600 text-start">{form.errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_unit_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                                            <Scale className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <select
                                            value={form.data.unit}
                                            onChange={(e) => form.setData('unit', e.target.value)}
                                            className="w-full ps-12 pe-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                        >
                                            {productUnits?.map((unit) => (
                                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                    {t('store_product_description_label')}
                                </label>
                                <textarea
                                    rows="3"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder={t('store_product_description_placeholder')}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white resize-none transition-all"
                                />
                            </div>

                            {/* Image Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-slate-700 text-start">
                                        {t('store_product_image_label')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowAiGenerator(!showAiGenerator)}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {showAiGenerator ? t('hide_ai_generator') : t('generate_with_ai')}
                                    </button>
                                </div>

                                {/* AI Generator */}
                                {showAiGenerator && (
                                    <div className="mb-4 p-4 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 space-y-3">
                                        <div className="flex items-center gap-2 text-purple-700">
                                            <Sparkles className="w-5 h-5" />
                                            <span className="text-sm font-semibold">{t('ai_image_generator')}</span>
                                        </div>
                                        <p className="text-xs text-purple-600">{t('ai_image_hint')}</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                placeholder={t('ai_prompt_placeholder')}
                                                className="flex-1 px-4 py-2.5 rounded-lg border border-purple-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all"
                                                disabled={isGenerating}
                                            />
                                            <button
                                                type="button"
                                                onClick={generateAiImage}
                                                disabled={isGenerating || !aiPrompt.trim()}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                {isGenerating ? t('generating') : t('generate')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Image Preview or Upload */}
                                {imagePreview ? (
                                    <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                        <button type="button" onClick={clearImage} className="absolute top-2 end-2 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors z-10">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="flex flex-col items-center">
                                            <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                            <p className="mt-2 text-xs text-slate-500">
                                                {generatedImageUrl ? t('ai_generated_image') : (form.data.image?.name || '')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                                        <div className="p-3 rounded-xl bg-primary-50 text-primary-600 mb-3">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{t('store_logo_placeholder')}</span>
                                        <span className="text-xs text-slate-500 mt-1">{t('store_logo_hint')}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                                {form.errors.image && <p className="mt-1.5 text-xs text-rose-600 text-start">{form.errors.image}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600/90 disabled:opacity-50 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                {form.processing ? t('store_submit_processing') : t('store_product_submit')}
                            </button>
                        </form>
                    </div>

                    {/* Products List */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-start">
                                <h3 className="text-lg font-semibold text-slate-900">{t('store_products_list_title')}</h3>
                                <p className="text-sm text-slate-500">{t('store_products_list_subtitle') || t('store_products_section_subtitle')}</p>
                            </div>
                        </div>

                        {products.data.length ? (
                            <div className="space-y-3">
                                {products.data.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-100/50 transition-colors"
                                    >
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <Package className="w-6 h-6 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 text-start">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                                                {product.is_available ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                        {t('product_available')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                        {t('product_unavailable')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">{product.category || t('uncategorized')}</p>
                                            <p className="text-xs text-slate-400">{formatDate(product.created_at)}</p>
                                        </div>
                                        
                                        {/* Price & Unit */}
                                        <div className="text-end space-y-1 flex-shrink-0">
                                            <div className="text-sm font-semibold text-primary-600" dir="ltr">
                                                {formatCurrency(product.price)}
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                {getUnitLabel(product.unit)}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                title={t('edit_product')}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingProduct(product)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title={t('delete_product')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500">{t('store_products_list_empty')}</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-slate-100">
                                {products.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                            link.active ? 'bg-primary-600 text-white border-primary-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-primary-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50" onClick={closeEditModal} />
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">{t('edit_product')}</h3>
                                <button onClick={closeEditModal} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_name_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                                    />
                                    {editForm.errors.name && <p className="mt-1 text-xs text-rose-600">{editForm.errors.name}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_category_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editForm.data.category_id}
                                        onChange={(e) => editForm.setData('category_id', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                    >
                                        {productCategories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price & Unit */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                            {t('store_product_price_label')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            dir="ltr"
                                            value={editForm.data.price}
                                            onChange={(e) => editForm.setData('price', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white text-left transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                            {t('store_product_unit_label')}
                                        </label>
                                        <select
                                            value={editForm.data.unit}
                                            onChange={(e) => editForm.setData('unit', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white appearance-none cursor-pointer transition-all"
                                        >
                                            {productUnits?.map((unit) => (
                                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_description_label')}
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white resize-none transition-all"
                                    />
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-start">
                                        {t('store_product_image_label')}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {editImagePreview && (
                                            <img src={editImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                                        )}
                                        <label className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                                            <Upload className="w-5 h-5 text-slate-400 me-2" />
                                            <span className="text-sm text-slate-600">{t('store_logo_placeholder')}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                                        </label>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_available"
                                        checked={editForm.data.is_available}
                                        onChange={(e) => editForm.setData('is_available', e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                    />
                                    <label htmlFor="is_available" className="text-sm font-medium text-slate-700">
                                        {t('product_available')}
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                                    >
                                        {t('cancel') || 'إلغاء'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-600/90 disabled:opacity-50 transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                        {editForm.processing ? t('store_submit_processing') : (t('save') || 'حفظ')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setDeletingProduct(null)} />
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-red-100 text-red-600">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{t('delete_product')}</h3>
                                    <p className="text-sm text-slate-500">{deletingProduct.name}</p>
                                </div>
                            </div>
                            <p className="text-slate-600">{t('confirm_delete_product')}</p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeletingProduct(null)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                                >
                                    {t('cancel') || 'إلغاء'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('delete_product')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StoreLayout>
    );
}
