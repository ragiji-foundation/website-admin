import { create } from 'zustand';
import { Banner, BannerType, isBannerType } from '@/types/banner';
import { getBannerByType } from '@/utils/bannerUtils';

interface BannerState {
  banners: Banner[];
  loading: boolean;
  error: Error | null;
  fetchBanners: () => Promise<void>;
  getBannerByType: (type: string, useFallback?: boolean) => Banner | undefined;
  createBanner: (bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBanner: (id: string, bannerData: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  loading: false,
  error: null,

  fetchBanners: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/banner');
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      set({ banners: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
        loading: false
      });
    }
  },

  getBannerByType: (type: string, useFallback = true) => {
    const bannerType = isBannerType(type) ? type : 'blog';
    return getBannerByType(get().banners, bannerType, useFallback);
  },

  createBanner: async (bannerData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create banner');
      }

      // Refetch banners to get the updated list
      await get().fetchBanners();
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
        loading: false
      });
    }
  },

  updateBanner: async (id, bannerData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/banner/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update banner');
      }

      // Update the banner in the state
      const updatedBanner = await response.json();
      set(state => ({
        banners: state.banners.map(b => b.id === id ? updatedBanner : b),
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
        loading: false
      });
    }
  },

  deleteBanner: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/banner/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete banner');
      }

      // Remove the banner from the state
      set(state => ({
        banners: state.banners.filter(b => b.id !== id),
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
        loading: false
      });
    }
  },
}));
