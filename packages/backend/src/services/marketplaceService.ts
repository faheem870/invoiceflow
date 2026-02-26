import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

// ---- Types ----

export interface ListingFilter {
  sellerAddress?: string;
  paymentToken?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  limit?: number;
}

export interface MarketplaceStats {
  activeListings: number;
  totalSold: number;
  totalVolume: string;
  averageDiscountPercent: number;
}

export interface PaginatedListings {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- Service class ----

export class MarketplaceService {
  /**
   * Query active marketplace listings with optional filters and pagination.
   * Joins the related Invoice so callers have full context.
   */
  async getActiveListings(filters: ListingFilter): Promise<PaginatedListings> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      expiry: { gt: new Date() },
    };

    if (filters.sellerAddress) {
      where.sellerAddress = filters.sellerAddress.toLowerCase();
    }
    if (filters.paymentToken) {
      where.paymentToken = filters.paymentToken.toLowerCase();
    }
    if (filters.minPrice || filters.maxPrice) {
      const salePriceFilter: any = {};
      if (filters.minPrice) {
        salePriceFilter.gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        salePriceFilter.lte = filters.maxPrice;
      }
      where.salePrice = salePriceFilter;
    }

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { invoice: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Compute aggregate marketplace statistics:
   *  - Number of active listings
   *  - Total sold count
   *  - Total volume (sum of salePrices for sold listings)
   *  - Average discount percent across sold listings
   */
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    const [
      activeListings,
      totalSold,
      volumeResult,
      discountResult,
    ] = await Promise.all([
      // Count currently active, non-expired listings
      prisma.listing.count({
        where: {
          isActive: true,
          expiry: { gt: new Date() },
        },
      }),

      // Count sold listings (isActive === false AND has a buyerAddress)
      prisma.listing.count({
        where: {
          isActive: false,
          buyerAddress: { not: null },
        },
      }),

      // Sum of sale prices for sold listings
      prisma.listing.aggregate({
        _sum: { salePrice: true },
        where: {
          isActive: false,
          buyerAddress: { not: null },
        },
      }),

      // All sold listings that have a discount percent recorded
      prisma.listing.findMany({
        where: {
          isActive: false,
          buyerAddress: { not: null },
          discountPercent: { not: null },
        },
        select: { discountPercent: true },
      }),
    ]);

    const totalVolume = volumeResult._sum.salePrice?.toString() ?? '0';

    // Compute average discount
    let averageDiscountPercent = 0;
    if (discountResult.length > 0) {
      const sum = discountResult.reduce((acc: number, item: any) => {
        return acc + parseFloat(item.discountPercent ?? '0');
      }, 0);
      averageDiscountPercent = parseFloat((sum / discountResult.length).toFixed(2));
    }

    return {
      activeListings,
      totalSold,
      totalVolume,
      averageDiscountPercent,
    };
  }

  /**
   * Record a sale: mark the listing as inactive, set the buyer address,
   * and update the invoice status to "sold" plus transfer ownership.
   */
  async recordSale(
    listingId: number,
    buyerAddress: string,
    buyTxHash?: string,
  ): Promise<any> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { invoice: true },
    });

    if (!listing) {
      throw new Error(`Listing with id=${listingId} not found`);
    }

    if (!listing.isActive) {
      throw new Error(`Listing id=${listingId} is already inactive`);
    }

    // Use a transaction so both the listing and the invoice are updated atomically
    const [updatedListing] = await prisma.$transaction([
      prisma.listing.update({
        where: { id: listingId },
        data: {
          isActive: false,
          buyerAddress: buyerAddress.toLowerCase(),
          buyTxHash: buyTxHash ?? undefined,
        },
        include: { invoice: true },
      }),
      prisma.invoice.update({
        where: { id: listing.invoiceId },
        data: {
          status: 'sold',
          currentOwnerAddress: buyerAddress.toLowerCase(),
        },
      }),
    ]);

    return updatedListing;
  }
}
