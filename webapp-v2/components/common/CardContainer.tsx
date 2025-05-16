"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type CardContainerProps = {
  children: ReactNode
  title?: string
  description?: string
  footer?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
}

export function CardContainer({
  children,
  title,
  description,
  footer,
  className = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
}: CardContainerProps) {
  return (
    <Card className={`bg-black/80 border-primary/30 ${className}`}>
      {(title || description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle className="text-primary">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer && <CardFooter className={`border-t border-border p-4 ${footerClassName}`}>{footer}</CardFooter>}
    </Card>
  )
}
