<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // General Settings
        Setting::set('site_name', 'DeliGo', 'text', 'general', 'Site Name', 'The name of your website', true);
        Setting::set('site_description', 'Fast delivery service for groceries, food, pharmacy and pet supplies', 'textarea', 'general', 'Site Description', 'Brief description of your website', true);
        Setting::set('site_logo', '/logo.png', 'image', 'general', 'Site Logo', 'Main logo of the website', true);
        Setting::set('site_favicon', '/images/favicon.ico', 'image', 'general', 'Site Favicon', 'Website favicon', true);

        // Contact Settings
        Setting::set('contact_phone', '+1 234 567 8900', 'text', 'contact', 'Contact Phone', 'Main contact phone number', true);
        Setting::set('contact_email', 'info@getirclone.com', 'text', 'contact', 'Contact Email', 'Main contact email address', true);
        Setting::set('contact_address', '123 Main Street, City, Country', 'textarea', 'contact', 'Contact Address', 'Physical address of the business', true);
        Setting::set('contact_whatsapp', '+1 234 567 8900', 'text', 'contact', 'WhatsApp Number', 'WhatsApp contact number', true);
        Setting::set('contact_facebook', 'https://facebook.com/getirclone', 'text', 'contact', 'Facebook URL', 'Facebook page URL', true);
        Setting::set('contact_instagram', 'https://instagram.com/getirclone', 'text', 'contact', 'Instagram URL', 'Instagram page URL', true);
        Setting::set('contact_twitter', 'https://twitter.com/getirclone', 'text', 'contact', 'Twitter URL', 'Twitter page URL', true);
        Setting::set('contact_linkedin', 'https://linkedin.com/company/getirclone', 'text', 'contact', 'LinkedIn URL', 'LinkedIn page URL', true);

        // App Download Settings
        Setting::set('app_download_title', 'Download Our App', 'text', 'app_download', 'App Download Title', 'Title for app download section', true);
        Setting::set('app_download_subtitle', 'Get the best delivery experience with our mobile app', 'textarea', 'app_download', 'App Download Subtitle', 'Subtitle for app download section', true);
        Setting::set('app_download_android_url', 'https://play.google.com/store/apps/details?id=com.getirclone', 'text', 'app_download', 'Android App URL', 'Google Play Store URL', true);
        Setting::set('app_download_ios_url', 'https://apps.apple.com/app/getirclone', 'text', 'app_download', 'iOS App URL', 'Apple App Store URL', true);
        Setting::set('app_download_android_file', null, 'file', 'app_download', 'Android APK File', 'Direct APK file for download', true);
        Setting::set('app_download_ios_file', null, 'file', 'app_download', 'iOS App File', 'Direct iOS app file for download', true);
        Setting::set('app_download_qr_code', null, 'image', 'app_download', 'QR Code', 'QR code for app download', true);

        // About Page Settings
        Setting::set('about_title', 'About Us', 'text', 'about', 'About Page Title', 'Title for about page', true);
        Setting::set('about_subtitle', 'We are committed to providing the best delivery service', 'textarea', 'about', 'About Page Subtitle', 'Subtitle for about page', true);
        Setting::set('about_content', 'We are a leading delivery service company...', 'textarea', 'about', 'About Page Content', 'Main content for about page', true);
        Setting::set('about_mission', 'Our mission is to make life easier for our customers', 'textarea', 'about', 'Mission Statement', 'Company mission statement', true);
        Setting::set('about_vision', 'To be the leading delivery service provider', 'textarea', 'about', 'Vision Statement', 'Company vision statement', true);

        // Help Page Settings
        Setting::set('help_title', 'Help Center', 'text', 'help', 'Help Page Title', 'Title for help page', true);
        Setting::set('help_subtitle', 'Find answers to your questions', 'textarea', 'help', 'Help Page Subtitle', 'Subtitle for help page', true);
        Setting::set('help_faq', '[]', 'json', 'help', 'FAQ Data', 'Frequently asked questions in JSON format', true);

        // Careers Page Settings
        Setting::set('careers_title', 'Join Our Team', 'text', 'careers', 'Careers Page Title', 'Title for careers page', true);
        Setting::set('careers_subtitle', 'Build your career with us', 'textarea', 'careers', 'Careers Page Subtitle', 'Subtitle for careers page', true);
        Setting::set('careers_content', 'We are always looking for talented individuals...', 'textarea', 'careers', 'Careers Page Content', 'Main content for careers page', true);
        Setting::set('careers_jobs', '[]', 'json', 'careers', 'Job Openings', 'Available job positions in JSON format', true);

        // SEO Settings
        Setting::set('seo_title', 'Getir Clone - Fast Delivery Service', 'text', 'seo', 'SEO Title', 'Default SEO title', true);
        Setting::set('seo_description', 'Fast delivery service for groceries, food, pharmacy and pet supplies', 'textarea', 'seo', 'SEO Description', 'Default SEO description', true);
        Setting::set('seo_keywords', 'delivery, groceries, food, pharmacy, pet supplies', 'text', 'seo', 'SEO Keywords', 'Default SEO keywords', true);
        Setting::set('seo_og_image', '/images/og-image.jpg', 'image', 'seo', 'Open Graph Image', 'Default social media sharing image', true);

        // Business Settings
        Setting::set('business_hours', '{"monday":"9:00-22:00","tuesday":"9:00-22:00","wednesday":"9:00-22:00","thursday":"9:00-22:00","friday":"9:00-22:00","saturday":"9:00-22:00","sunday":"10:00-20:00"}', 'json', 'business', 'Business Hours', 'Business operating hours', true);
        Setting::set('delivery_fee', '2.99', 'text', 'business', 'Delivery Fee', 'Standard delivery fee', true);
        Setting::set('minimum_order', '15.00', 'text', 'business', 'Minimum Order', 'Minimum order amount for free delivery', true);
        Setting::set('delivery_time', '30', 'text', 'business', 'Delivery Time', 'Average delivery time in minutes', true);
    }
}
