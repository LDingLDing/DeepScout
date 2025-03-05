import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '../modules/staff/entities/staff.entity';

export const Roles = (...roles: StaffRole[]) => SetMetadata('roles', roles);
