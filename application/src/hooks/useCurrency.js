import { useAppSelector } from '../store/hooks';

export const useCurrency = () => {
  const { currencySymbol } = useAppSelector((state) => state.settings);

  return currencySymbol;
};
