import { prisma } from '../services/prisma.service';

export class BaseRepository<T> {
  protected model: any;

  constructor(modelName: string) {
    this.model = prisma[modelName];
  }

  async findAll(options: any = {}): Promise<T[]> {
    return this.model.findMany(options);
  }

  async findById(id: number, options: any = {}): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  async findOne(where: any, options: any = {}): Promise<T | null> {
    return this.model.findFirst({
      where,
      ...options,
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(id: number, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async count(where: any = {}): Promise<number> {
    return this.model.count({
      where,
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    where: any = {},
    orderBy: any = { id: 'desc' }
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async transaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
    return prisma.$transaction(fn);
  }
} 