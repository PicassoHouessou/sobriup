# IoT Module Monitoring System

*Read this in other languages: [Français](README.fr.md).*

This project is an IoT module monitoring system developed with Symfony. It allows you to track the operating status of
modules, view the measured values, and display this information visually.

## Features

- **Creation of IoT Modules**: Add new modules via a form.
- **Module Monitoring**: View the current operating status, uptime, number of data points sent, and measured values.
- **Tracking Graphs**: Track the evolution of measured values using graphs.
- **Notifications**: Receive visual notifications in case of module malfunctions.
- **Module Simulation**: Automatically simulate the states and values of modules with a Symfony command.

## Prerequisites

- [PHP 8](https://www.php.net/)
- [Symfony 7](https://symfony.com/doc/current/setup.html)
- [Composer](https://getcomposer.org/)
- [pnpm](https://pnpm.io/fr/)
- [Docker](https://www.docker.com/)

## Quick Installation

### For Linux and macOS

`make` commands are available to simplify installation and setup:

- **Clone the repository:**
    ```bash
    git clone https://github.com/PicassoHouessou/iot
    cd iot
    ```

- **Complete Installation**: Run the following command to install all dependencies (Composer and pnpm) and generate the
  database:

  ```bash
  make first-install
  ```

This command will set everything up. Open your web browser and navigate to **https://localhost:8000**.
Please use **localhost** instead of 127.0.0.1.

- **Start the notification server:**

  We use Docker to install the instant notification server. To start the Mercure server, run:
  ```bash
  docker-compose up --build
  ```

- **Database Generation**: If you have already installed the dependencies and only want to generate the database, run
  the following command. By default, you don't need to run this command because SQLite is used for the database and the
  file is already provided:

  ```bash
  make data
  ```

## Detailed Installation

### 1. Clone the repository

```bash
git clone https://github.com/PicassoHouessou/iot
cd iot
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install JavaScript dependencies with pnpm or yarn

```bash
pnpm install
```

### 4. Compile assets

For the development environment, run:

```bash
pnpm run dev-server
```

For the production environment, run:

```bash
pnpm run build
```

### 5. Configure the environment

**By default, you don't need to configure anything because SQLite is used for the database.** If you want to use MySQL,
do the following:

Copy the `.env` file and adjust the configuration parameters (database, etc.):

```bash
cp .env .env.local
```

Modify `.env.local` as needed.

### 6. Create the database and run migrations

```bash
make console doctrine:database:drop # Delete the database
make console doctrine:database:create # Create the database
make console doctrine:migrations:migrate # Run the migration
```

### 7. Load fixtures

```bash
make console hautelook:fixtures:load --no-interaction # Generate the fixtures
```

### 8. Start the development server

```bash
symfony server:start
```

Please use **localhost** instead of 127.0.0.1.
Eg: https://localhost:8000

### 9. The notification server
The Docker containers, including the Mercure server, accessible
at http://localhost:3000.

### 10. Run the simulation command

To simulate the values and statuses of the modules, run the following command:

```bash
make console app:module:simulate
```

You can automate this command with a cron job for periodic execution.

## Usage

- Access the web interface via the URL provided by the Symfony server.
- Use the form to add new modules.
- View the status and values of the modules on the monitoring page.
- Receive notifications in case of module malfunctions.

## Technologies Used

- **Backend**: PHP 8, Symfony 7, Doctrine ORM
- **Frontend**: HTML, CSS, TypeScript, JavaScript, Bootstrap, Antd, React
- **Database**: SQLite
- **Development Tools**: Composer, pnpm, Faker

## Contributing

Contributions are welcome! Please submit a pull request for any feature or improvement.

## License

This project is licensed under the NPOSL-3.0 License. See the [LICENSE](https://opensource.org/license/NPOSL-3.0) file
for details.

## Contact

For any inquiries or support, please contact [Picasso Houessou](mailto:houessoupicasso@yahoo.fr).


