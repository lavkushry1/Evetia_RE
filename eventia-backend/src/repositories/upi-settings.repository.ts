import { BaseRepository } from './base.repository';
import { UpiSetting } from '@prisma/client';

export class UpiSettingsRepository extends BaseRepository<UpiSetting> {
  constructor() {
    super('upiSetting');
  }

  async findActive(): Promise<UpiSetting | null> {
    return this.model.findFirst({
      where: {
        isActive: true,
      },
    });
  }

  async findByVpa(upiVpa: string): Promise<UpiSetting | null> {
    return this.model.findUnique({
      where: { upiVpa },
    });
  }

  async updateSettings(
    id: number,
    data: {
      upiVpa?: string;
      merchantName?: string;
      discountCode?: string;
      discountAmount?: number;
      isActive?: boolean;
    }
  ): Promise<UpiSetting> {
    return this.transaction(async (tx) => {
      // If setting new VPA as active, deactivate all other VPAs
      if (data.isActive) {
        await tx.upiSetting.updateMany({
          where: {
            id: {
              not: id,
            },
          },
          data: {
            isActive: false,
          },
        });
      }

      return tx.upiSetting.update({
        where: { id },
        data,
      });
    });
  }

  async createSettings(
    data: {
      upiVpa: string;
      merchantName: string;
      discountCode?: string;
      discountAmount?: number;
      isActive?: boolean;
    }
  ): Promise<UpiSetting> {
    return this.transaction(async (tx) => {
      // If creating as active, deactivate all other VPAs
      if (data.isActive) {
        await tx.upiSetting.updateMany({
          where: {
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

      return tx.upiSetting.create({
        data,
      });
    });
  }
} 