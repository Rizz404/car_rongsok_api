# Environment Configuration

Project ini menggunakan environment variables untuk konfigurasi yang aman dan fleksibel.

## 📁 File Structure

```
.env.example    # ✅ Committed - Template dengan nilai example (safe)
.env            # ❌ Ignored - Local file dengan credentials asli kamu
```

## 🔧 Setup untuk Development

1. **Copy template ke .env:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env dengan credentials kamu:**
   ```env
   DATABASE_URL=postgres://postgres:your-password@localhost:5432/car_db
   JWT_SECRET=your-secure-secret-here
   ```

3. **File .env adalah milik kamu sendiri dan tidak akan di-commit**

## 🚀 Production (Railway)

Di Railway, set environment variables di dashboard:
- `NODE_ENV=production`
- `DATABASE_URL=<Railway PostgreSQL URL>`
- `JWT_SECRET=<Generate dengan: openssl rand -hex 32>`
- `PORT` (Railway sets this automatically)

## ⚠️ Important

- **NEVER commit .env** - Berisi credentials asli kamu
- **.env.example is safe** - Hanya template dengan example values
- **Railway uses environment variables** - Set di dashboard, bukan dari file

## 📦 Required Variables

All environments need:
- `NODE_ENV` - development/production
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret untuk signing JWT tokens
- `PORT` - Server port (optional, defaults to 3000)
