# Nest JS + Prisma (GraphQL) API

(
Nest + Prisma + Graphql + MySQL
)

---

**Prerequisites:**

If the NestJS is not already installed, execute the following command

> npm install -g @nestjs/cli

Install Prisma 2 (2.2.2 or latest version)

> npm install -g @prisma/cli@2.2.2

### Create a new NestJS application

Execute the following command to create a new NestJS application

> nest new nest-js-prisma-api

### Add Prisma 2 capabilities to the project

Install and add the capabilities at once and generate the client

> npx prisma init
> npm install @prisma/client

`A new directory named as`**prisma** `with .env and schema.prisma files will be created once the above setup is done.`

### Setup database (MySQL) Connection and Prepare database

Open .end file and update the environment variable as under

    DATABASE_URL="mysql://sa:PASSWORD@localhost:3306/jobs-db"

Before proceeding further crate the database with name `jobs-db`

Execute the following scripts one after another.

    CREATE DATABASE `jobs-db`

    USE `jobs-db`;

    CREATE TABLE company (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(50) DEFAULT NULL,
        PRIMARY KEY (id)
    )
    ENGINE = INNODB,
    CHARACTER SET utf8mb4,

    CREATE TABLE employee (
        id int(11) NOT NULL AUTO_INCREMENT,
        companyId int(11) NOT NULL,
        employeeName varchar(50) DEFAULT NULL,
        gender varchar(6) DEFAULT NULL,
        email varchar(50) DEFAULT NULL,
        PRIMARY KEY (id)
    )
    ENGINE = INNODB,
    CHARACTER SET utf8mb4,

After creating the database and tables as shown above seed some sample data.

### Generating Prisma Schema

Run the following command to generating the schema

> prisma introspect

The `schema.prisma` file will be appended with schemas generated based on the MySQL tables. However notice that generated `model` classes are named lower-case. Change their names to proper-case. Also there is no relation between two models is set. Create a relationship link between both the tables as shown in the [prisma documentation](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations).

The `schema.prisma` file should appear as under:

    generator client {
        provider = "prisma-client-js"
    }

    datasource db {
        provider = "mysql"
        url      = env("DATABASE_URL")
    }

    model Company {
        id       Int        @default(autoincrement()) @id
        name     String?
        Employee Employee[]
    }

    model Employee {
        id           Int     @default(autoincrement()) @id
        companyId    Int
        email        String?
        employeeName String?
        gender       String?

        company Company @relation(fields: [companyId], references: [id]) //add relation
    }

### Generate Prisma Client

Once the introspection is done, we have to generate the Prisma client (This step is to be followed every time the DB schema changed/Prisma introspect changes made.)

> npx prisma generate

After executing the above command, You should notice message like `✔ Generated Prisma Client to .\node_modules\@prisma\client in 30ms` on the console.

### Generate Prisma Service for Nest

> nest generate service prisma

After executing the above command a directory named `prisma` will be generated under `src` (or project root) directory.

Update the service file with following code for  making the use of Nest Lifecycle Events `OnModuleInit` and `OnModuleDestroy`

    import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
    import { PrismaClient } from '@prisma/client';

    @Injectable()
    export class PrismaService extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    }

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }
    }

### Inject Prisma Service to the App Controller

Open the `app.controller.ts` and inject prisma service to access the company and employee service operations via DI.

A basic example of updated `app.controller.ts` should look like

    import { Controller, Get, Param, Post } from '@nestjs/common';
    import { AppService } from './app.service';
    import { PrismaService } from './prisma/prisma.service';

        @Controller()
        export class AppController {
        constructor(
            private readonly appService: AppService,
            private readonly prisma: PrismaService,
        ) {}

        @Get()
        getHello(): string {
            return this.appService.getHello();
        }

        /*Company*/

        @Get('company')
        async companies() {
            return await this.prisma.company.findMany();
        }

        @Get('company/:id')
        async company(@Param('id') id: string) {
            return await this.prisma.company.findOne({ where: { id: +id } });
        }

        /*Employee*/

        @Get('employee')
        async employees() {
            return await this.prisma.employee.findMany();
        }

        @Get('employee/:id')
        async employee(@Param('id') id: string) {
            return await this.prisma.employee.findOne({ where: { id: +id } });
        }
    }

*Other operations using POST, PATCH and DELETE are not shown for keeping the example shorter and easy to understand.*

