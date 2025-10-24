# FinWise AI - داشبورد مالی هوشمند

FinWise AI یک داشبورد مالی شخصی است که به شما کمک می‌کند تا مالیات خود را مدیریت کنید، تراکنش‌های بانکی را تحلیل کنید و بینش‌های مالی دریافت کنید.

## ویژگی‌ها

- آپلود تراکنش های بانکی (Excel/PDF)
- دسته‌بندی خودکار تراکنش‌ها
- نمودارهای تحلیلی
- مدیریت دسته‌بندی‌ها
- خلاصه مالی

## فناوری‌ها

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- Recharts (Data Visualization)
- Shadcn UI Components

## راه‌اندازی محلی

1. ریپازیتوری را کلون کنید:
   \`\`\`bash
   git clone https://github.com/yourusername/finwise-ai.git
   \`\`\`

2. وارد پوشه پروژه شوید:
   \`\`\`bash
   cd finwise-ai
   \`\`\`

3. وابستگی‌ها را نصب کنید:
   \`\`\`bash
   npm install
   \`\`\`

4. متغیرهای محیطی را تنظیم کنید:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   سپس فایل `.env.local` را ویرایش کنید و اطلاعات Supabase خود را وارد کنید.

5. سرور توسعه را اجرا کنید:
   \`\`\`bash
   npm run dev
   \`\`\`

6. در مرورگر به [http://localhost:3000](http://localhost:3000) بروید.

## استقرار

برای استقرار می‌توانید از Vercel استفاده کنید:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## ساختار پروژه

- `src/app` - صفحات و layout اصلی
- `src/components` - کامپوننت‌های قابل استفاده مجدد
- `src/lib` - توابع کمکی
- `public` - فایل‌های استاتیک

## مجوز

MIT License - جزئیات را در فایل LICENSE ببینید.
