import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dtos/create-order.dto';
import { VerifyPaymentDto } from './dtos/payment.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a pending order for one or more courses' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.ordersService.createOrder(createOrderDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  async getMyOrders(@CurrentUser() user: { userId: string; role: string }) {
    return await this.ordersService.getMyOrders(user.userId);
  }

  @Get('payments/callback')
  @ApiOperation({
    summary: 'Verify a payment callback and enroll purchased courses',
  })
  async verifyPaymentCallback(
    @Query('Authority') authority: string,
    @Query('Status') status: 'OK' | 'NOK' = 'OK',
  ) {
    return await this.ordersService.verifyPayment(authority, status);
  }

  @Post('payments/verify')
  @ApiOperation({ summary: 'Verify a payment manually for MVP/testing' })
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return await this.ordersService.verifyPayment(
      verifyPaymentDto.authority ?? '',
      verifyPaymentDto.status ?? 'OK',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single current-user order' })
  async getOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.ordersService.getOrder(orderId, user.userId);
  }

  @Post(':id/payment/request')
  @ApiOperation({
    summary: 'Create an MVP payment request for a pending order',
  })
  async requestPayment(
    @Param('id') orderId: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return await this.ordersService.requestPayment(orderId, user.userId);
  }
}
