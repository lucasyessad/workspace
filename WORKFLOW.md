# 📋 Workflow Git - iCloud & GitHub

## Configuration

- **Répertoire iCloud** : `/Users/lounis/Library/Mobile Documents/com~apple~CloudDocs/workspace`
- **Remote GitHub** : `https://github.com/lucasyessad/workspace.git`
- **Branche** : `main`
- **Fichiers ignorés** : `.DS_Store`, `*.icloud`

---

## ⚡ Workflow Quotidien

### Envoyer vos modifications sur GitHub

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/workspace
git add .
git commit -m "Description de vos changements"
git push
```

### Version courte avec alias

```bash
icloud
git add . && git commit -m "Mon changement" && git push
```

---

## 🔄 Récupérer les changements du serveur

```bash
git pull
```

---

## 📊 Commandes utiles

**Voir l'état du dépôt :**
```bash
git status
```

**Voir l'historique :**
```bash
git log --oneline
```

**Annuler les changements locaux :**
```bash
git checkout .
```

**Voir les différences :**
```bash
git diff
```

---

## 💡 Bonnes pratiques

1. ✅ Faites un `git pull` avant de commencer votre travail
2. ✅ Commitez régulièrement avec des messages clairs
3. ✅ Poussez vos changements à la fin de votre session
4. ✅ Évitez de modifier directement sur GitHub

---

## 🚀 Créer un alias pour iCloud

Ajoutez cette ligne à votre `.zshrc` ou `.bash_profile` :

```bash
echo "alias icloud='cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/workspace'" >> ~/.zshrc
source ~/.zshrc
```

Puis utilisez simplement :
```bash
icloud
```
