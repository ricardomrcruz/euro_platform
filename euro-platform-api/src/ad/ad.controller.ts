import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AdService } from './ad.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { UpdateAdContentDto } from './dto/update-ad-content.dto';
import { RejectAdDto } from './dto/reject-ad.dto';
import { CreateAdPhotoDto } from './dto/create-ad-photo.dto';
import { RequestPhotoUploadUrlDto } from './dto/request-photo-upload-url.dto';
import { CreateAdMessageDto } from './dto/create-ad-message.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import type { RequestUser } from '../auth/interfaces/authenticated-request.interface';

@Controller('ads')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateAdDto) {
    return this.adService.createAd(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdDto,
  ) {
    return this.adService.updateAd(user.id, id, dto);
  }

  // Content-only edit for a VALIDATED ad -- see Ad.canEditContent()/resubmitForReview().
  @Patch(':id/content')
  updateContent(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdContentDto,
  ) {
    return this.adService.updateContent(user.id, id, dto);
  }

  @Post(':id/submit')
  submit(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.adService.submitAd(user.id, id);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/validate')
  validate(@Param('id', ParseIntPipe) id: number) {
    return this.adService.validateAd(id);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/reject')
  reject(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectAdDto,
  ) {
    return this.adService.rejectAd(user, id, dto.message);
  }

  @Post(':id/photos')
  addPhoto(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAdPhotoDto,
  ) {
    return this.adService.addPhoto(user.id, id, dto);
  }

  @Post(':id/photos/upload-url')
  requestPhotoUploadUrl(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RequestPhotoUploadUrlDto,
  ) {
    return this.adService.requestPhotoUploadUrl(user.id, id, dto);
  }

  @Public()
  @Get()
  listPublic() {
    return this.adService.listPublic();
  }

  // Declared above @Get(':id') deliberately -- NestJS matches routes in declaration order
  // within a controller, so ':id' would otherwise swallow "pending" as a literal id value.
  @Roles(UserRole.ADMIN)
  @Get('pending')
  listPending() {
    return this.adService.findPending();
  }

  @Public()
  @Get(':id')
  findOne(@CurrentUser() user: RequestUser | undefined, @Param('id', ParseIntPipe) id: number) {
    return this.adService.findVisible(id, user);
  }

  @Post(':id/messages')
  addMessage(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAdMessageDto,
  ) {
    return this.adService.addMessage(user, id, dto.message);
  }

  @Get(':id/messages')
  listMessages(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.adService.listMessages(user, id);
  }
}
