import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '../entities/staff_user/staff-user.entity';

export const Roles = (...roles: StaffRole[]) => SetMetadata('roles', roles);
