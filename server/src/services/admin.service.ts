import { prisma } from '../config/prisma';

export const getStats = async () => {
  const [totalUsers, activeItems, resolvedItems, totalMatches] = await Promise.all([
    prisma.user.count(),
    prisma.item.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.item.count({ where: { status: 'RESOLVED' } }),
    prisma.match.count(),
  ]);

  return {
    totalUsers,
    activeItems,
    resolvedItems,
    totalMatches,
  };
};

export const getUsers = async (page = 1, limit = 20, search?: string) => {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { items: true, claims: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
};

export const getItems = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { name: true, email: true } },
        category: true,
        _count: { select: { claims: true } }
      },
    }),
    prisma.item.count(),
  ]);

  return {
    items,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const moderateItem = async (itemId: string, action: 'DELETE' | 'RESTORE' | 'HARD_DELETE') => {
  if (action === 'HARD_DELETE') {
    return prisma.item.delete({
      where: { id: itemId },
    });
  } else if (action === 'DELETE') {
    return prisma.item.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  } else {
    return prisma.item.update({
      where: { id: itemId },
      data: { deletedAt: null },
    });
  }
};
