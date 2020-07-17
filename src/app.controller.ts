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
