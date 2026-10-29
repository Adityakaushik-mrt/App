import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  Fuel,
  ShoppingBag,
  Home,
  Zap,
  Smartphone,
  Wifi,
  Activity,
  GraduationCap,
  Film,
  Plane,
  Box,
  Sparkles,
  Landmark,
  MoreHorizontal,
  Tag,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color = '#006874',
  size = 18,
  className = '',
}) => {
  const iconProps = { size, color, className: 'shrink-0' };

  switch (iconName?.toLowerCase()) {
    case 'utensils':
    case 'food':
    case 'food & drinks':
      return <Utensils {...iconProps} />;
    case 'shoppingcart':
    case 'groceries':
      return <ShoppingCart {...iconProps} />;
    case 'car':
    case 'transportation':
      return <Car {...iconProps} />;
    case 'fuel':
    case 'petrol & fuel':
      return <Fuel {...iconProps} />;
    case 'shoppingbag':
    case 'shopping':
      return <ShoppingBag {...iconProps} />;
    case 'home':
    case 'rent':
      return <Home {...iconProps} />;
    case 'zap':
    case 'electricity':
      return <Zap {...iconProps} />;
    case 'smartphone':
    case 'mobile':
    case 'mobile recharge':
      return <Smartphone {...iconProps} />;
    case 'wifi':
    case 'internet':
      return <Wifi {...iconProps} />;
    case 'activity':
    case 'medical':
    case 'medical & healthcare':
      return <Activity {...iconProps} />;
    case 'graduationcap':
    case 'education':
      return <GraduationCap {...iconProps} />;
    case 'film':
    case 'entertainment':
      return <Film {...iconProps} />;
    case 'plane':
    case 'travel':
      return <Plane {...iconProps} />;
    case 'box':
    case 'household':
      return <Box {...iconProps} />;
    case 'sparkles':
    case 'personal care':
      return <Sparkles {...iconProps} />;
    case 'landmark':
    case 'emi & loan':
      return <Landmark {...iconProps} />;
    case 'cash':
      return <Banknote {...iconProps} />;
    case 'upi':
      return <QrCode {...iconProps} />;
    case 'debit card':
    case 'credit card':
      return <CreditCard {...iconProps} />;
    case 'bank transfer':
      return <Building2 {...iconProps} />;
    default:
      return <Tag {...iconProps} />;
  }
};
