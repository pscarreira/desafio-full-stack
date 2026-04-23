import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildRepository } from '@/domain/application/repositories/child-repository';
import { MongoChildRepository } from './repositories/mongo-child-repository';
import { ChildModel, ChildSchema } from './schemas/child.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: ChildModel.name, schema: ChildSchema }]),
	],
	providers: [
		{
			provide: ChildRepository,
			useClass: MongoChildRepository,
		},
	],
	exports: [ChildRepository],
})
export class DatabaseModule {}
