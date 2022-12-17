import {
  DynamicModule,
  Module,
  ModuleMetadata,
  FactoryProvider,
} from '@nestjs/common';
import IORedis, { Redis, RedisOptions } from 'ioredis';

export const IORedisKey = 'IOREDIS';

type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  onClientReady?: (client: Redis) => void;
};

type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class RedisModule {
  static async registerAsync({
    imports,
    useFactory,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider = {
      provide: IORedisKey,
      useFactory: async (...args) => {
        const { connectionOptions, onClientReady } = await useFactory(...args);
        const client = new IORedis(connectionOptions);

        onClientReady(client);

        return client;
      },
      inject,
    };

    // this is a dynamic module that we will return..
    // the format is the same as the @Module() decorator
    return {
      module: RedisModule,
      imports: imports,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
