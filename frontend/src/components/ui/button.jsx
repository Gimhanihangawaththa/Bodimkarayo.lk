import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "px-4 py-2 rounded-lg font-medium transition-colors",
  {
    variants: {
      intent: {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  }
)

export const Button = ({ intent, className, ...props }) => {
  const classes = buttonVariants({ intent })
  return <button className={`${classes} ${className || ''}`} {...props} />
}
