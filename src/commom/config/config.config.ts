import { ConfigModuleOptions } from '@nestjs/config';

export const configModuleConfig: ConfigModuleOptions<Record<string, any>> = {
  isGlobal: true,
};
