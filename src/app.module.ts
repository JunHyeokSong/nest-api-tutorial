import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ModelModule } from './model/model.module';


@Module({
  imports: [AuthModule, UserModule, BookmarkModule, ModelModule],
})
export class AppModule {}
