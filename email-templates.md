# AtypikHouse Email Templates

## 📧 Confirmation Email Template

### Subject Line:
```
Bienvenue chez AtypikHouse - Confirmez votre compte
```

### HTML Template:
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation AtypikHouse</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <div style="display: inline-block; background-color: white; border-radius: 50%; width: 60px; height: 60px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; color: #059669;">🌲</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">AtypikHouse</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Hébergements insolites et éco-responsables</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Bienvenue chez AtypikHouse !</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Merci de vous être inscrit sur AtypikHouse. Nous sommes ravis de vous accueillir dans notre communauté d'amoureux de la nature et d'hébergements insolites.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Pour activer votre compte et commencer à explorer nos cabanes dans les arbres, yourtes traditionnelles et cabanes flottantes, veuillez confirmer votre inscription :
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); transition: all 0.3s ease;">
                    🌲 Confirmer mon compte
                </a>
            </div>

            <!-- Alternative Link -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 500;">Si le bouton ne fonctionne pas, copiez et collez ce lien :</p>
                <p style="color: #059669; margin: 0; font-size: 14px; word-break: break-all; font-family: monospace;">{{ .ConfirmationURL }}</p>
            </div>

            <!-- Features -->
            <div style="margin: 40px 0;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Découvrez nos hébergements :</h3>
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1; text-align: center; padding: 15px; background-color: #f0fdf4; border-radius: 8px;">
                        <span style="font-size: 24px;">🏡</span>
                        <p style="color: #059669; margin: 5px 0 0 0; font-weight: 600; font-size: 14px;">Cabanes dans les arbres</p>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 15px; background-color: #f0fdf4; border-radius: 8px;">
                        <span style="font-size: 24px;">⛺</span>
                        <p style="color: #059669; margin: 5px 0 0 0; font-weight: 600; font-size: 14px;">Yourtes traditionnelles</p>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 15px; background-color: #f0fdf4; border-radius: 8px;">
                        <span style="font-size: 24px;">🚣</span>
                        <p style="color: #059669; margin: 5px 0 0 0; font-weight: 600; font-size: 14px;">Cabanes flottantes</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                🌱 AtypikHouse - Depuis 2023 • Pierrefonds, Oise
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                Hébergements insolites et éco-responsables en France et en Europe
            </p>
        </div>
    </div>
</body>
</html>
```

## 🔄 Password Reset Email Template

### Subject Line:
```
AtypikHouse - Réinitialisation de votre mot de passe
```

### HTML Template:
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation AtypikHouse</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <div style="display: inline-block; background-color: white; border-radius: 50%; width: 60px; height: 60px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; color: #059669;">🔐</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">AtypikHouse</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Sécurité de votre compte</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Réinitialisation de mot de passe</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte AtypikHouse.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                    🔐 Réinitialiser mon mot de passe
                </a>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
                    ⚠️ <strong>Sécurité :</strong> Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
            </div>

            <!-- Alternative Link -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 500;">Si le bouton ne fonctionne pas, copiez et collez ce lien :</p>
                <p style="color: #059669; margin: 0; font-size: 14px; word-break: break-all; font-family: monospace;">{{ .ConfirmationURL }}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                🌱 AtypikHouse - Sécurité et confiance
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                Votre sécurité est notre priorité
            </p>
        </div>
    </div>
</body>
</html>
```

## 📧 Magic Link Email Template

### Subject Line:
```
AtypikHouse - Connexion sécurisée
```

### HTML Template:
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion AtypikHouse</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <div style="display: inline-block; background-color: white; border-radius: 50%; width: 60px; height: 60px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px; color: #059669;">🔗</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">AtypikHouse</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Connexion sans mot de passe</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Connexion sécurisée</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Cliquez sur le bouton ci-dessous pour vous connecter à votre compte AtypikHouse de manière sécurisée :
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                    🔗 Se connecter
                </a>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #f0fdf4; border: 1px solid #059669; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #047857; margin: 0; font-size: 14px; font-weight: 500;">
                    🔒 <strong>Sécurité :</strong> Ce lien est unique et expirera dans 10 minutes. Ne partagez jamais ce lien.
                </p>
            </div>

            <!-- Alternative Link -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 500;">Si le bouton ne fonctionne pas, copiez et collez ce lien :</p>
                <p style="color: #059669; margin: 0; font-size: 14px; word-break: break-all; font-family: monospace;">{{ .ConfirmationURL }}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                🌱 AtypikHouse - Connexion simplifiée et sécurisée
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                Vivez des expériences uniques en harmonie avec la nature
            </p>
        </div>
    </div>
</body>
</html>
```

## 🎨 Design Features

### **Branding Elements:**
- ✅ **Green gradient** - Matches your website's eco-friendly theme
- ✅ **Tree icon** - Represents nature and sustainability
- ✅ **AtypikHouse branding** - Consistent with your website
- ✅ **Professional layout** - Clean and modern design

### **User Experience:**
- ✅ **Mobile responsive** - Works on all devices
- ✅ **Clear call-to-action** - Prominent buttons
- ✅ **Security notices** - Important information highlighted
- ✅ **Alternative links** - Fallback for button issues

### **Eco-Friendly Messaging:**
- ✅ **Nature emojis** - 🌲 🏡 ⛺ 🚣 🌱
- ✅ **Sustainability focus** - "éco-responsables"
- ✅ **Natural imagery** - Tree icons and green colors

## 📋 Implementation Steps

1. **Go to Supabase Dashboard**
2. **Navigate to Authentication > Email Templates**
3. **Select each template type** (Confirm signup, Reset Password, Magic Link)
4. **Copy and paste the corresponding HTML template**
5. **Update the subject lines**
6. **Save changes**

The templates are now ready to provide a professional, branded experience for your users! 🎯✨ 