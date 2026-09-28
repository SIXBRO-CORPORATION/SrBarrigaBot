import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {WebModule} from "./web/configuration/web.module.js";
import {SecurityModule} from "./security/configuration/security.module.js";
import {BusinessModule} from "./business/configuration/business.module.js";
import {PersistenceModule} from "./persistence/configuration/persistence.module.js";

@Module({
  imports: [ThrottlerModule.forRoot([{ttl: 60_000, limit: 100}]), WebModule, SecurityModule, BusinessModule, PersistenceModule],
  controllers: [],
  providers: [{provide: APP_GUARD, useClass: ThrottlerGuard}],
})
export class AppModule {}
