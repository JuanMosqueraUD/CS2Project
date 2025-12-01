import { inject, type InjectionKey } from 'vue';

export interface NavigationState {
  navigateTo: (level: string) => void;
}

export const NavigationKey: InjectionKey<NavigationState> = Symbol('navigation');

export function useNavigation() {
  const navigation = inject(NavigationKey);
  
  if (!navigation) {
    console.warn('Navigation context not found');
    return {
      navigateTo: () => {}
    };
  }
  
  return navigation;
}
