# Système de Surveillance de Modules IoT

Ce projet est un système de surveillance de modules IoT développé avec Symfony. Il vous permet de suivre l'état de
fonctionnement des modules, de visualiser les valeurs mesurées et d'afficher ces informations de manière visuelle.

## Fonctionnalités

- **Création de Modules IoT** : Ajouter de nouveaux modules via un formulaire.
- **Surveillance des Modules** : Voir l'état de fonctionnement actuel, le temps de fonctionnement, le nombre de données
  envoyées et les valeurs mesurées.
- **Graphiques de Suivi** : Suivre l'évolution des valeurs mesurées à l'aide de graphiques.
- **Notifications** : Recevoir des notifications visuelles en cas de dysfonctionnement des modules.
- **Simulation de Modules** : Simuler automatiquement les états et les valeurs des modules avec une commande Symfony.

## Prérequis

- [PHP 8](https://www.php.net/)
- [Symfony 7](https://symfony.com/doc/current/setup.html)
- [Composer](https://getcomposer.org/)
- [pnpm](https://pnpm.io/fr/)
- [SQLite](https://www.sqlite.org/)
- [Docker](https://www.docker.com/) (Requis pour les notifications instantanées)

## Installation Rapide

### Pour Linux et macOS

Des commandes `make` sont disponibles pour simplifier l'installation et la configuration :

- **Cloner le dépôt :**
    ```bash
    git clone https://github.com/PicassoHouessou/iot
    cd iot
    ```

- **Installation Complète** : Exécutez la commande suivante pour installer toutes les dépendances (Composer et pnpm) et
  générer la base de données :

  ```bash
  make first-install
  ```

Cette commande configurera tout. Ouvrez votre navigateur web et accédez à **https://localhost:8000**. Veuillez utiliser
**localhost** au lieu de 127.0.0.1.

- **Démarrer le serveur de notifications :**

  Nous utilisons Docker pour installer le serveur de notifications instantanées. Pour démarrer le serveur Mercure,
  exécutez :
  ```bash
  docker-compose up --build
  ```

- **Génération de la base de données** : Si vous avez déjà installé les dépendances et que vous souhaitez uniquement
  générer la base de données, exécutez la commande suivante. Par défaut, vous n'avez pas besoin d'exécuter cette
  commande car SQLite est utilisé pour la base de données et le fichier est déjà fourni :

  ```bash
  make data
  ```

## Installation Détaillée

### 1. Cloner le dépôt

```bash
git clone https://github.com/PicassoHouessou/iot
cd iot
```

### 2. Installer les dépendances PHP

```bash
composer install
```

### 3. Installer les dépendances JavaScript avec pnpm ou yarn

```bash
pnpm install
```

### 4. Compiler les assets

Pour l'environnement de développement, exécutez :

```bash
pnpm run dev-server
```

Pour l'environnement de production, exécutez :

```bash
pnpm run build
```

### 5. Configurer l'environnement

**Par défaut, vous n'avez pas besoin de configurer quoi que ce soit car SQLite est utilisé pour la base de données.** Si
vous souhaitez utiliser MySQL, procédez comme suit :

Copiez le fichier `.env` et ajustez les paramètres de configuration (base de données, etc.) :

```bash
cp .env .env.local
```

Modifiez `.env.local` selon vos besoins.

### 6. Créer la base de données et exécuter les migrations

```bash
php bin/console doctrine:database:drop # Supprimer la base de données
php bin/console doctrine:database:create # Créer la base de données
php bin/console doctrine:migrations:migrate # Exécuter la migration
```

### 7. Charger les fixtures

```bash
php bin/console hautelook:fixtures:load --no-interaction # Générer les fixtures
```

### 8. Démarrer le serveur de développement

```bash


symfony server:start
```

Veuillez utiliser **localhost** au lieu de 127.0.0.1.
Par exemple : https://localhost:8000

### 9. Démarrer le serveur de notifications

Nous utilisons Docker pour installer le serveur de notifications instantanées. Pour démarrer le serveur de notifications
Mercure, exécutez :

```bash
docker-compose up --build
```

Cette commande va construire et démarrer les conteneurs Docker, y compris le serveur Mercure, accessible à
l'adresse http://localhost:3000.

### 10. Exécuter la commande de simulation

Pour simuler les valeurs et les états des modules, exécutez la commande suivante :

```bash
php bin/console app:module:simulate
```

Vous pouvez automatiser cette commande avec un cron job pour une exécution périodique.

## Utilisation

- Accédez à l'interface web via l'URL fournie par le serveur Symfony.
- Utilisez le formulaire pour ajouter de nouveaux modules.
- Visualisez l'état et les valeurs des modules sur la page de surveillance.
- Recevez des notifications en cas de dysfonctionnement des modules.

## Technologies Utilisées

- **Backend** : PHP 8, Symfony 7, Doctrine ORM
- **Frontend** : HTML, CSS, TypeScript, JavaScript, Bootstrap, Antd, React
- **Base de Données** : SQLite
- **Outils de Développement** : Composer, pnpm, Faker

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une pull request pour toute fonctionnalité ou amélioration.

## Licence

Ce projet est sous licence NPOSL-3.0. Voir le fichier [LICENSE](https://opensource.org/license/NPOSL-3.0) pour plus de
détails.

## Contact

Pour toute question ou demande de support, veuillez contacter [Picasso Houessou](mailto:houessoupicasso@yahoo.fr).

```
