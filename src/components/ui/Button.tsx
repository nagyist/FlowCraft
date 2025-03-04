'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const variants = {
  primary: {
    background: 'bg-gradient-to-r from-fuchsia-600 to-indigo-600',
    hover: 'hover:shadow-fuchsia-200/50',
    text: 'text-white',
  },
  secondary: {
    background: 'bg-white',
    hover: 'hover:border-fuchsia-200 hover:shadow-fuchsia-100/30',
    text: 'text-slate-800',
  },
  outline: {
    background: 'bg-gradient-to-r from-fuchsia-50 to-indigo-50',
    hover: 'hover:shadow-fuchsia-100/30',
    text: 'text-fuchsia-700',
  },
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-10 py-4 text-base',
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  ...props
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  fullWidth?: boolean
  className?: string
  [key: string]: any
}) {
  const buttonClasses = `
    group
    relative
    font-medium
    rounded-full
    transition-all
    duration-300
    shadow-md
    hover:shadow-xl
    ${variants[variant]?.background || variants.primary.background}
    ${variants[variant]?.text || variants.primary.text}
    ${variants[variant]?.hover || variants.primary.hover}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  const buttonContent = (
    <>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
        {icon && <span className="ml-1">{icon}</span>}
      </span>
      {variant === 'primary' && (
        <span className="absolute inset-0 -z-10 translate-y-full rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 transition-transform duration-300 group-hover:translate-y-0"></span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {buttonContent}
      </Link>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {buttonContent}
    </motion.button>
  )
}
