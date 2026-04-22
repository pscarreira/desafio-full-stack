import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/domain/use-cases/authenticate-user';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { EnvModule } from '../env/env.module';
import { AuthenticateController } from './controllers/authenticate.controller';

@Module({
	imports: [CryptographyModule, EnvModule],
	controllers: [AuthenticateController],
	providers: [AuthenticateUserUseCase],
	exports: [],
})
export class HttpModule {}
