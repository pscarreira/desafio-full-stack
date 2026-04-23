import { Module } from '@nestjs/common';
import { AuthenticateUserUseCase } from '@/domain/application/use-cases/authenticate-user';
import { FetchChildByIdUseCase } from '@/domain/application/use-cases/fetch-child-by-id';
import { ListChildrenUseCase } from '@/domain/application/use-cases/list-children';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { DatabaseModule } from '../database/database.module';
import { EnvModule } from '../env/env.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { FetchChildByIdController } from './controllers/fetch-child-by-id.controller';
import { ListChildrenController } from './controllers/list-children.controller';

@Module({
	imports: [CryptographyModule, EnvModule, DatabaseModule],
	controllers: [
		AuthenticateController,
		ListChildrenController,
		FetchChildByIdController,
	],
	providers: [
		AuthenticateUserUseCase,
		ListChildrenUseCase,
		FetchChildByIdUseCase,
	],
	exports: [],
})
export class HttpModule {}
