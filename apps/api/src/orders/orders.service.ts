import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../courses/entities/enrollment.entity';
import { CourseStatus } from '../courses/course-status.enum';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { OrderStatus } from './order-status.enum';
import { PaymentStatus } from './payment-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(PaymentTransaction)
    private transactionsRepository: Repository<PaymentTransaction>,
    @InjectRepository(Course) private coursesRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: string): Promise<Order> {
    const courseIds = [...new Set(dto.course_ids)];
    const courses = await this.coursesRepository.find({
      where: { id: In(courseIds), status: CourseStatus.PUBLISHED },
    });

    if (courses.length !== courseIds.length) {
      throw new BadRequestException('One or more courses are not available');
    }

    const existingEnrollments = await this.enrollmentsRepository.find({
      where: { user_id: userId, course_id: In(courseIds) },
    });

    if (existingEnrollments.length > 0) {
      throw new BadRequestException(
        'You already have access to one or more selected courses',
      );
    }

    const items = courses.map((course) =>
      this.orderItemsRepository.create({
        course_id: course.id,
        course_title: course.title,
        unit_price: Number(course.discount_price ?? course.price),
      }),
    );

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.unit_price),
      0,
    );
    const order = this.ordersRepository.create({
      user_id: userId,
      total_amount: totalAmount,
      status: OrderStatus.PENDING,
      items,
    });

    return await this.ordersRepository.save(order);
  }

  async getMyOrders(userId: string): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { user_id: userId },
      relations: { items: true, transactions: true },
      order: { created_at: 'DESC' },
    });
  }

  async getOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: { items: true, transactions: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.user_id !== userId)
      throw new ForbiddenException('You can only view your own orders');
    return order;
  }

  async requestPayment(orderId: string, userId: string) {
    const order = await this.getOrder(orderId, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be paid');
    }

    await this.ensureOrderItemsAreStillPurchasable(order);

    const transaction = this.transactionsRepository.create({
      order_id: order.id,
      amount: order.total_amount,
      authority: `MVP-${Date.now()}-${order.id}`,
      status: PaymentStatus.INITIATED,
    });
    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    return {
      order_id: order.id,
      transaction_id: savedTransaction.id,
      authority: savedTransaction.authority,
      gateway: savedTransaction.gateway,
      payment_url: `/api/v1/orders/payments/callback?Authority=${savedTransaction.authority}&Status=OK`,
      amount: Number(order.total_amount),
      currency: order.currency,
    };
  }

  async verifyPayment(authority: string, status: 'OK' | 'NOK' = 'OK') {
    const transaction = await this.transactionsRepository.findOne({
      where: { authority },
      relations: { order: { items: true } },
    });

    if (!transaction)
      throw new NotFoundException('Payment transaction not found');
    if (transaction.status === PaymentStatus.VERIFIED) return transaction.order;

    const order = transaction.order;
    if (status !== 'OK') {
      transaction.status = PaymentStatus.FAILED;
      transaction.error_message = 'Payment was canceled or failed by gateway';
      order.status = OrderStatus.FAILED;
      order.failure_reason = transaction.error_message;
      await this.ordersRepository.save(order);
      await this.transactionsRepository.save(transaction);
      throw new BadRequestException(transaction.error_message);
    }

    await this.ensureOrderItemsAreStillPurchasable(order);

    for (const item of order.items) {
      const enrollment = this.enrollmentsRepository.create({
        user_id: order.user_id,
        course_id: item.course_id,
      });
      await this.enrollmentsRepository.save(enrollment);
    }

    transaction.status = PaymentStatus.VERIFIED;
    transaction.ref_id = `MVP-${transaction.id}`;
    order.status = OrderStatus.PAID;
    order.failure_reason = null;
    await this.ordersRepository.save(order);
    await this.transactionsRepository.save(transaction);

    return order;
  }

  private async ensureOrderItemsAreStillPurchasable(
    order: Order,
  ): Promise<void> {
    const courseIds = order.items.map((item) => item.course_id);
    const existingEnrollments = await this.enrollmentsRepository.find({
      where: { user_id: order.user_id, course_id: In(courseIds) },
    });
    if (existingEnrollments.length > 0) {
      throw new BadRequestException('One or more courses are already enrolled');
    }
  }
}
