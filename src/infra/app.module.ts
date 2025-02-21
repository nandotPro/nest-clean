import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@/infra/env/env';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from './http/http.module';
import { EnvModule } from './env/env.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    AuthModule,
    HttpModule,
    EnvModule,
    StorageModule,
  ],
})


export class AppModule {}
