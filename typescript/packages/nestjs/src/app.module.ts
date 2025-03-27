import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './config.service';
import { PythonService } from './python.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ConfigService, PythonService],
})
export class AppModule {}
