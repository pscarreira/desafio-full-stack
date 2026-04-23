import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildModel, ChildSchema } from './schemas/child.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: ChildModel.name, schema: ChildSchema }]),
	],
	providers: [],
	exports: [],
})
export class DatabaseModule {}
