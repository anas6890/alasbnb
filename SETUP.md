# 🚀 Guide de Configuration - Alasbnb

## ✅ Étapes complétées
✓ Fichier `.env.local` créé avec toutes les variables nécessaires
✓ Warning React "key prop" corrigé dans Footer et FooterColumn

## 📋 Configuration requise (À faire)

### 1. **MongoDB Database** 🗄️
- Crée un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crée un cluster gratuit
- Obtiens ta chaîne de connexion
- Remplace dans `.env.local`:
  ```
  DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/airbnb?retryWrites=true&w=majority"
  ```

### 2. **Google OAuth** 🔐
- Va sur [Google Cloud Console](https://console.cloud.google.com/)
- Crée un nouveau projet
- Crée des identifiants OAuth 2.0 (application web)
- Ajoute `http://localhost:3000/api/auth/callback/google` comme URI de redirection autorisé
- Copie CLIENT_ID et CLIENT_SECRET dans `.env.local`:
  ```
  GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="xxx"
  ```

### 3. **Facebook OAuth** 📱
- Va sur [Facebook Developers](https://developers.facebook.com/)
- Crée une nouvelle application
- Configure les paramètres OAuth
- Ajoute `http://localhost:3000/api/auth/callback/facebook` en URI de redirection
- Copie l'ID et le Secret:
  ```
  FACEBOOK_ID="xxx"
  FACEBOOK_SECRET="xxx"
  ```

### 4. **NextAuth Secret** 🔑
- Remplace la valeur placeholder par une vraie clé secrète (n'importe quelle chaîne aléatoire):
  ```
  NEXTAUTH_SECRET="une-clé-secrète-aléatoire-très-longue"
  ```

### 5. **Cloudinary** ☁️ (Upload d'images)
- Crée un compte sur [Cloudinary](https://cloudinary.com/)
- Obtiens ton Cloud Name
- Remplace dans `.env.local`:
  ```
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="ton_cloud_name"
  ```

### 6. **IP Lookup** (Optionnel - pour déterminer le pays dans le Footer)
- Va sur [extreme-ip-lookup.com](https://extreme-ip-lookup.com/)
- Obtiens une clé API
- Remplace dans `.env.local`:
  ```
  NEXT_PUBLIC_LOOKUP_KEY="ta_clé_api"
  ```

## 🚀 Après configuration

```bash
# Initialise Prisma
npx prisma generate
npx prisma db push

# Lance le serveur de développement
npm run dev
```

## ⚠️ Avertissements résolus

| Erreur | Solution |
|--------|----------|
| `DATABASE_URL` manquante | ✅ Fichier `.env.local` créé |
| React "key" warning | ✅ Clés ajoutées dans Footer.tsx et FooterColumn.tsx |
| NextAuth `NO_SECRET` | ✅ `NEXTAUTH_SECRET` à configurer dans `.env.local` |
| NextAuth `NEXTAUTH_URL` | ✅ Configured dans `.env.local` |
| EXPERIMENTAL_API | ℹ️ Normal avec Next.js 13 App Router - pas grave |

## 📝 Fichiers modifiés

- ✅ `.env.local` - Créé avec toutes les variables
- ✅ `components/Footer.tsx` - Ajout des clés React
- ✅ `components/FooterColumn.tsx` - Ajout des clés React

Une fois que tu auras configuré tous les services externes, l'application devrait fonctionner correctement! 🎉

