import { Module } from '@nestjs/common';
import { PrismaModule } from './core/database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MovieModule } from './modules/movies/movie.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MovieFilesModule } from './modules/movie-files/movie-files.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AdminModule } from './modules/admin/admin.module';
import { JwtTokenModule } from './core/utils/jwt.module';
import { JwtModule } from '@nestjs/jwt';
import { SeederModule } from './common/seeders/seeder.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET
		}),
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(),"src","uploads")
		}),
		PrismaModule,
		AuthModule,
		AdminModule,
		UserModule,
		ProfileModule,
		MovieModule,
		CategoriesModule,
		FavoritesModule,
		ReviewsModule,
		SubscriptionModule,
		MovieFilesModule,
		WatchHistoryModule,
		JwtTokenModule,
		SeederModule
	]
})
export class AppModule {}
