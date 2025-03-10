import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@/infra/env/env';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from './http/http.module';
import { EnvModule } from './env/env.module';
import { EventsModule } from './events/events.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    AuthModule,
    HttpModule,
    EnvModule,
    EventsModule,
  ],
})


export class AppModule {}
