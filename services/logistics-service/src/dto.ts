import { IsIn, IsString, IsUUID } from 'class-validator';
export class CreateShipmentDto {
  @IsUUID() outletId!: string;
  @IsUUID() orderId!: string;
  @IsString()
  @IsIn(['pathao', 'steadfast'])
  provider!: string;
}
export class DeliveryWebhookDto {
  @IsUUID() orderId!: string;
  @IsString() status!: string;
  @IsString() trackingId!: string;
}
