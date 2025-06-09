import React from 'react';

const Input = React.forwardRef(({ 
  type = 'text', 
  placeholder = '', 
  value = '', 
  onChange = () => {}, 
  className = '', 
  tag = 'input',
  options = [],
  required = false,
  ...props 
}, ref) => {
  const baseClasses = `
    w-full px-4 py-3 border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    placeholder-gray-500 text-gray-900 bg-white
    transition-all duration-200 ease-in-out
    hover:border-gray-400
  `;

  const combinedClasses = `${baseClasses} ${className}`.trim();

  if (tag === 'textarea') {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={combinedClasses}
        required={required}
        {...props}
      />
    );
  }

  if (tag === 'select') {
    return (
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        className={combinedClasses}
        required={required}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
</select>
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={combinedClasses}
      required={required}
      {...props}
    />
  );
});

// Add display name for better debugging
Input.displayName = 'Input';

export default Input;