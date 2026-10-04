const base = 'px-4 py-2 rounded-lg font-medium transition-colors'
const variants = {
  default: 'bg-[#3488c3] text-white hover:bg-[#2978b3]',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
}

export const Button = ({ intent = 'default', className = '', ...props }) => {
  const variantClass = variants[intent] || variants.default
  return <button className={`${base} ${variantClass} ${className}`} {...props} />
}
