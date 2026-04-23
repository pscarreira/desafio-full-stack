import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/domain/application/use-cases/authenticate-user';
import { ListChildrenUseCase } from '@/domain/application/use-cases/list-children';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { DatabaseModule } from '../database/database.module';
import { EnvModule } from '../env/env.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { ListChildrenController } from './controllers/list-children.controller';

@Module({
	imports: [CryptographyModule, EnvModule, DatabaseModule],
	controllers: [AuthenticateController, ListChildrenController],
	providers: [AuthenticateUserUseCase, ListChildrenUseCase],
	exports: [],
})
export class HttpModule {}
