import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Use the /company and /employee routes for CRUD';
  }
}
