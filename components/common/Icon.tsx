import React from 'react';
import {
  Search,
  SlidersHorizontal,
  Home,
  Bookmark,
  MessageCircle,
  User,
  Users,
  UsersRound,
  MapPin,
  BadgeCheck,
  Bed,
  ShowerHead,
  Calendar,
  Plus,
  GraduationCap,
  Forward,
  X,
  Armchair,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

// Icon name mapping (SF Symbols names to Lucide icons)
const iconMap: Record<string, LucideIcon> = {
  search: Search,
  'slider.horizontal.3': SlidersHorizontal,
  house: Home,
  bookmark: Bookmark,
  message: MessageCircle,
  person: User,
  'person.2': Users,
  'person.3': UsersRound,
  'location.fill': MapPin,
  'checkmark.seal.fill': BadgeCheck,
  'bed.double.fill': Bed,
  'shower.fill': ShowerHead,
  calendar: Calendar,
  plus: Plus,
  'graduationcap.fill': GraduationCap,
  'square.and.arrow.up': Forward,
  xmark: X,
  'chair.fill': Armchair,
  'chevron.left': ChevronLeft,
  'chevron.right': ChevronRight,
};

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 24, className = '', strokeWidth = 2 }: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
