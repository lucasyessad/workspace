import { Module } from '@nestjs/common';
import { RdvController } from './rdv.controller';
import { RdvService } from './rdv.service';
import { FilAttenteGateway } from './fil-attente.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RdvController],
  providers: [RdvService, FilAttenteGateway],
  exports: [RdvService],
})
export class RdvModule {}
