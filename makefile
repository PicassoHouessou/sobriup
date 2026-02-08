#---VARIABLES---------------------------------#
ifndef ROOT
ROOT:= $(shell ( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P ))
GENERATE_DATA= $(ROOT)/scriptGenerateDataApp.sh
endif

#---GIT---#
GIT  = git
GIT_SUBMODULE = $(GIT) submodule
GIT_SUBMODULE_UPDATE = $(GIT_SUBMODULE) update --init
GIT_SUBMODULE_FOREACH = $(GIT_SUBMODULE) foreach
#------------#

#---DOCKER---#
DOCKER = docker
DOCKER_RUN = $(DOCKER) run
DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_UP = $(DOCKER_COMPOSE) up -d
DOCKER_COMPOSE_STOP = $(DOCKER_COMPOSE) stop
#------------#

# Docker containers
PHP_CONT = $(DOCKER_COMPOSE) exec php

# Executables
PHP      = $(PHP_CONT) php
COMPOSER = $(PHP_CONT) composer
SYMFONY_CONSOLE  = $(PHP) bin/console

SYMFONY_LINT = $(SYMFONY_CONSOLE) lint:
#------------#

#---MODULE-#
SIMULATE = $(SYMFONY_CONSOLE) app:module:simulate
#------------#

#---COMPOSER-#
COMPOSER_INSTALL = $(COMPOSER) install
COMPOSER_UPDATE = $(COMPOSER) update
#------------#

#---PNPM-----#
PNPM = pnpm
PNPM_INSTALL = $(PNPM) install --force
PNPM_UPDATE = $(PNPM) update
PNPM_BUILD = $(PNPM) run build
PNPM_DEV = $(PNPM) run dev
PNPM_DEV_SERVER = $(PNPM) run dev-server
PNPM_WATCH = $(PNPM) run watch
#------------#

#---YARN-----#
YARN = yarn
YARN_INSTALL = $(YARN) install --force
YARN_UPDATE = $(YARN) update
YARN_BUILD = $(YARN) run build
YARN_DEV = $(YARN) run dev
YARN_DEV_SERVER = $(YARN) run dev-server
YARN_WATCH = $(YARN) run watch
#------------#

#---NPM-----#
NPM = npm
NPM_INSTALL = $(NPM) install --force
NPM_UPDATE = $(NPM) update
NPM_BUILD = $(NPM) run build
NPM_DEV = $(NPM) run dev
NPM_WATCH = $(NPM) run watch
#------------#

#---PHPQA---#
PHPQA = jakzal/phpqa
PHPQA_RUN = $(DOCKER_RUN) --init -it --rm -v $(PWD):/project -w /project $(PHPQA)
#------------#

#---PHPUNIT-#
PHPUNIT = APP_ENV=test $(SYMFONY) php bin/phpunit
#------------#
#---------------------------------------------#

## === 🆘  HELP ==================================================
help: ## Show this help.
	@echo "Symfony-And-Docker-Makefile"
	@echo "---------------------------"
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
#---------------------------------------------#

## === 🐋  DOCKER ================================================
build: ## Builds the Docker images
	@$(eval c ?=)
	@$(DOCKER_COMPOSE) build $(c)

docker-up: ## Start docker containers.
	$(DOCKER_COMPOSE_UP)
.PHONY: docker-up

up: ## Start docker containers.
	$(DOCKER_COMPOSE_UP)
.PHONY: up

down: ## Remove docker containers.
	$(DOCKER_COMPOSE) down
.PHONY: down

docker-stop: ## Stop docker containers.
	# $(DOCKER_COMPOSE_STOP)
.PHONY: docker-stop
#---------------------------------------------#

logs: ## Show live logs
	@$(DOCKER_COMPOSE) logs --tail=0 --follow

sh: ## Connect to the FrankenPHP container
	@$(PHP_CONT) sh

bash: ## Connect to the FrankenPHP container via bash so up and down arrows go to previous commands
	@$(PHP_CONT) bash

test: ## Start tests with phpunit, pass the parameter "c=" to add options to phpunit, example: make test c="--group e2e --stop-on-failure"
	@$(eval c ?=)
	@$(DOCKER_COMPOSE) exec -e APP_ENV=test php bin/phpunit $(c)



## === 🎛️  SYMFONY ===============================================
sf: ## List all Symfony commands or pass the parameter "c=" to run a given command, example: make sf c=about
	@$(eval c ?=)
	@$(SYMFONY_CONSOLE) $(c)

cc: c=c:c ## Clear the cache
cc: sf

console: ## List all Symfony commands or pass the parameter "c=" to run a given command, example: make sf c=about
	@$(eval c ?=)
	@$(SYMFONY_CONSOLE) $(c)
.PHONY: console

sf-cc: ## Clear symfony cache.
	$(SYMFONY_CONSOLE) cache:clear
.PHONY: sf-cc

sf-assets: ## Install bundle's web assets under a public directory.
	$(SYMFONY_CONSOLE) assets:install
.PHONY: sf-assets

sf-dc: ## Create symfony database.
	$(SYMFONY_CONSOLE) doctrine:database:create --if-not-exists > /dev/null 2>&1 || true
	$(SYMFONY_CONSOLE) doctrine:database:create  > /dev/null 2>&1 || true # A hack to support both mysql and sqlite
.PHONY: sf-dc

sf-dd: ## Drop symfony database.
	$(SYMFONY_CONSOLE) doctrine:database:drop --if-exists --force > /dev/null 2>&1 || true
	$(SYMFONY_CONSOLE) doctrine:database:drop --force > /dev/null 2>&1 || true # A hack to support both mysql and sqlite
.PHONY: sf-dd

sf-su: ## Update symfony schema database.
	$(SYMFONY_CONSOLE) doctrine:schema:update --force
.PHONY: sf-su

sf-mm: ## Make migrations.
	$(SYMFONY_CONSOLE) make:migration
.PHONY: sf-mm

sf-dmm: ## Migrate.
	$(SYMFONY_CONSOLE) doctrine:migrations:migrate --no-interaction
.PHONY: sf-dmm

sf-fixtures: ## Load fixtures.
	$(SYMFONY_CONSOLE) hautelook:fixtures:load --no-interaction
	#$(SYMFONY_CONSOLE) doctrine:fixtures:load --no-interaction
.PHONY: sf-fixtures

sf-me: ## Make symfony entity
	$(SYMFONY_CONSOLE) make:entity
.PHONY: sf-me

sf-mc: ## Make symfony controller
	$(SYMFONY_CONSOLE) make:controller
.PHONY: sf-mc

sf-mf: ## Make symfony Form
	$(SYMFONY_CONSOLE) make:form
.PHONY: sf-mf

sf-perm: ## Fix permissions.
	chmod -R 777 var
.PHONY: sf-perm

sf-sudo-perm: ## Fix permissions with sudo.
	sudo chmod -R 777 var
.PHONY: sf-sudo-perm

sf-dump-env: ## Dump env.
	$(SYMFONY_CONSOLE) debug:dotenv
.PHONY: sf-dump-env

sf-dump-env-container: ## Dump Env container.
	$(SYMFONY_CONSOLE) debug:container --env-vars
.PHONY: sf-dump-env-container

sf-dump-routes: ## Dump routes.
	$(SYMFONY_CONSOLE) debug:router
.PHONY: sf-dump-routes

sf-open: ## Open project in a browser.
	$(SYMFONY) open:local
.PHONY: sf-open

sf-open-email: ## Open Email catcher.
	$(SYMFONY) open:local:webmail
.PHONY: sf-open-email

sf-check-requirements: ## Check requirements.
	$(SYMFONY) check:requirements
.PHONY: sf-check-requirements
#---------------------------------------------#

## === 📦  COMPOSER ==============================================
composer-install: ## Install composer dependencies.
	$(COMPOSER_INSTALL)
.PHONY: composer-install

composer: ## Alias of composer-install. Install composer dependencies.
	$(COMPOSER_INSTALL)
.PHONY: composer

composer-update: ## Update composer dependencies.
	$(COMPOSER_UPDATE)
.PHONY: composer-update

composer-validate: ## Validate composer.json file.
	$(COMPOSER) validate
.PHONY: composer-validate

composer-validate-deep: ## Validate composer.json and composer.lock files in strict mode.
	$(COMPOSER) validate --strict --check-lock
.PHONY: composer-validate-deep
#---------------------------------------------#

## === 📦  PNPM ===================================================
pnpm-install: ## Install pnpm dependencies.
	pnpm install
.PHONY: pnpm-install

pnpm-update: ## Update pnpm dependencies.
	pnpm update
.PHONY: pnpm-update

pnpm-build: ## Build assets.
	pnpm run build
.PHONY: pnpm-build

pnpm-dev: ## Build assets in dev mode.
	pnpm run dev
.PHONY: pnpm-dev

pnpm-dev-server: ## Build assets in dev mode and watch.
	pnpm run dev-server
.PHONY: pnpm-dev-server

pnpm-watch: ## Watch assets.
	pnpm run watch
.PHONY: pnpm-watch
#---------------------------------------------#

## === 📦  YARN ===================================================
yarn-install: ## Install yarn dependencies.
	$(YARN_INSTALL)
.PHONY: yarn-install

yarn-update: ## Update yarn dependencies.
	$(YARN_UPDATE)
.PHONY: yarn-update

yarn-build: ## Build assets.
	$(YARN_BUILD)
.PHONY: yarn-build

yarn-dev: ## Build assets in dev mode.
	$(YARN_DEV)
.PHONY: yarn-dev

yarn-dev-server: ## Build assets in dev mode and watch.
	$(YARN_DEV_SERVER)
.PHONY: yarn-dev-server

yarn-watch: ## Watch assets.
	$(YARN_WATCH)
.PHONY: yarn-watch
#---------------------------------------------#

# === 📦  NPM ===================================================
# npm-install: ## Install npm dependencies.
# 	$(NPM_INSTALL)
# .PHONY: npm-install

# npm-update: ## Update npm dependencies.
# 	$(NPM_UPDATE)
# .PHONY: npm-update

# npm-build: ## Build assets.
# 	$(NPM_BUILD)
# .PHONY: npm-build

# npm-dev: ## Build assets in dev mode.
# 	$(NPM_DEV)
# .PHONY: npm-dev

# npm-watch: ## Watch assets.
# 	$(NPM_WATCH)
#.PHONY: npm-watch
#---------------------------------------------#

## === 🐛  PHPQA =================================================
qa-cs-fixer-dry-run: ## Run php-cs-fixer in dry-run mode.
	$(PHPQA_RUN) php-cs-fixer fix ./src --rules=@Symfony --verbose --dry-run
.PHONY: qa-cs-fixer-dry-run

qa-cs-fixer: ## Run php-cs-fixer.
	$(PHPQA_RUN) php-cs-fixer fix ./src --rules=@Symfony --verbose
.PHONY: qa-cs-fixer

qa-phpstan: ## Run phpstan.
	$(PHPQA_RUN) phpstan analyse ./src --level=7
.PHONY: qa-phpstan

qa-security-checker: ## Run security-checker.
	$(SYMFONY) security:check
.PHONY: qa-security-checker

qa-phpcpd: ## Run phpcpd (copy/paste detector).
	$(PHPQA_RUN) phpcpd ./src
.PHONY: qa-phpcpd

qa-php-metrics: ## Run php-metrics.
	$(PHPQA_RUN) phpmetrics --report-html=var/phpmetrics ./src
.PHONY: qa-php-metrics

qa-lint-twigs: ## Lint twig files.
	$(SYMFONY_LINT)twig ./templates
.PHONY: qa-lint-twigs

qa-lint-yaml: ## Lint yaml files.
	$(SYMFONY_LINT)yaml ./config
.PHONY: qa-lint-yaml

qa-lint-container: ## Lint container.
	$(SYMFONY_LINT)container
.PHONY: qa-lint-container

qa-lint-schema: ## Lint Doctrine schema.
	$(SYMFONY_CONSOLE) doctrine:schema:validate --skip-sync -vvv --no-interaction
.PHONY: qa-lint-schema

qa-audit: ## Run composer audit.
	$(COMPOSER) audit
.PHONY: qa-audit
#---------------------------------------------#

## === 🔎  TESTS =================================================
tests: ## Run tests.
	$(PHPUNIT) --testdox
.PHONY: tests

tests-coverage: ## Run tests with coverage.
	$(PHPUNIT) --coverage-html var/coverage
.PHONY: tests-coverage
#---------------------------------------------#

## === ⭐  APPLICATION =================================================
bundles: ## Generate fixtures from Bundles.
	$(MAKE) sf-dd
	$(MAKE) sf-dc
	$(MAKE) sf-su
	$(MAKE) sf-fixtures --append --group=bundles
.PHONY: bundles

pem: ## Generate JWT tokens.
	mkdir -p config/jwt
	openssl genrsa -out config/jwt/private.pem 4096
	openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem
	chmod -R 775 config/
.PHONY: pem

data: ## Generate fixtures for the project.
	$(MAKE) sf-dd
	$(MAKE) sf-dc
	$(MAKE) sf-su
	$(MAKE) sf-fixtures
.PHONY: data

checkout: ## Pull all modules for the specified branch. Eg: make checkout dev
	$(GIT) pull
	$(GIT_SUBMODULE_UPDATE)
	$(GIT_SUBMODULE_FOREACH) git fetch origin
	$(GIT_SUBMODULE_FOREACH) git checkout $(filter-out $@,$(MAKECMDGOALS))
	$(GIT_SUBMODULE_FOREACH) git pull
.PHONY: checkout


checkout-dev:  ## Pull all modules for branch dev.
	$(GIT) pull
	$(GIT_SUBMODULE_UPDATE)
	$(GIT_SUBMODULE_FOREACH) git checkout dev
	$(GIT_SUBMODULE_FOREACH) git pull
.PHONY: checkout-dev
#---------------------------------------------#

## === MODULE SIMULATION =================================================
simulate: ## Run simulation.
	$(SIMULATE)
.PHONY: simulate
#---------------------------------------------#

## === ⭐  OTHERS =================================================
before-commit: qa-cs-fixer qa-phpstan qa-security-checker qa-phpcpd qa-lint-twigs qa-lint-yaml qa-lint-container qa-lint-schema tests ## Run before commit.
.PHONY: before-commit

dev: docker-up yarn-build sf-perm data sf-start sf-open ## First install.
.PHONY: dev

.PHONY: env-setup
env-setup: ## Create .env from .env.example if .env does not exist
	@test -f .env || cp .env.example .env

.PHONY: vendor
vendor: ## Install vendors according to the current composer.lock file
vendor: c=install --prefer-dist --no-progress --no-scripts --no-interaction
vendor: composer

install:  ## First install.
	make env-setup
	make down || true
	make build
	make up
	make vendor
	#make secret
	# Symfony Encore assets is handled by the host
	$(PNPM) install || true
	$(PNPM) build || true
	$(MAKE) composer-install
	$(MAKE) pnpm-install
	$(MAKE) pnpm-build || true
	$(MAKE) sf-perm || true
	$(MAKE) pem
	$(MAKE) data
	$(MAKE) sf-cc || true
	$(MAKE) sf-assets
	$(MAKE) sf-start
	$(MAKE) sf-open
.PHONY: install

start: docker-up sf-start sf-open ## Start project.
.PHONY: start

stop: docker-stop sf-stop ## Stop project.
.PHONY: stop

clear: ## Clear symfony cache.
	$(sf-cc)
.PHONY: clear


reset-db: ## Reset database.
	$(eval CONFIRM := $(shell read -p "Are you sure you want to reset the database? [y/N] " CONFIRM && echo $$(CONFIRM:-N}))
	@if [ "$(CONFIRM)" = "y" ]; then \
		$(MAKE) sf-dd; \
		$(MAKE) sf-dc; \

	#$(MAKE) sf-dmm; \
	fi
.PHONY: reset-db
#---------------------------------------------#



