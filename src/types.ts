/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  HTMLAttributes
} from 'react';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type BrandVariant = 'primary' | 'secondary' | 'dark' | 'text' | 'accent' | 'outline' | 'ghost' | 'link';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BrandVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  id: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  id: string;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  id: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  id: string;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'bordered' | 'glass' | 'dark';
  hoverable?: boolean;
  id: string;
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'charcoal' | 'linen' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  id: string;
}

export interface ChipProps extends HTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
  onRemove?: () => void;
  id: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  id: string;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  position?: 'left' | 'right';
  id: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  id: string;
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeTabId?: string;
  onChange?: (id: string) => void;
  variant?: 'minimal' | 'pills' | 'underline';
  id: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  id: string;
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
  id: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  id: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}
