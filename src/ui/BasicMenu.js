"use client"
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Button from "./Button"

export default function BasicMenu({ name = "Menu", options = [] }) {
  const handleOptionClick = (option) => {
    if (option.onClick) {
      option.onClick();
    }
    if (option.href) {
      window.location.href = option.href;
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Button} variant="secondary" size="small" className="inline-flex items-center gap-1.5">
        {name}
        <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-60 origin-top-right rounded-lg bg-white shadow-lg outline-1 outline-black/5 
          transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in 
          dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10 border border-neutral-200/70 dark:border-gray-700"
      >
        <div className="py-1">
          {options.map((option, index) => (
            option?.divider ? (
              <div key={`div-${index}`} className="my-1 mx-2 border-t border-neutral-200/80 dark:border-gray-700" />
            ) : (
              <MenuItem key={index} disabled={option?.disabled}>
                {({ focus, disabled }) => (
                  option.type === 'button' ? (
                    <button
                      onClick={() => !disabled && handleOptionClick(option)}
                      disabled={disabled}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm rounded-md 
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
                        ${focus && !disabled ? 'bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {option.icon && <span className="size-4 text-gray-500 dark:text-gray-400">{option.icon}</span>}
                        {option.label}
                      </span>
                      {option.shortcut && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">{option.shortcut}</span>
                      )}
                    </button>
                  ) : (
                    <a
                      href={option.href || "#"}
                      onClick={() => !disabled && handleOptionClick(option)}
                      aria-disabled={disabled}
                      className={`flex items-center justify-between gap-3 px-4 py-2 text-sm rounded-md 
                        ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} 
                        data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden dark:data-focus:bg-white/5 dark:data-focus:text-white`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {option.icon && <span className="size-4 text-gray-500 dark:text-gray-400">{option.icon}</span>}
                        {option.label}
                      </span>
                      {option.shortcut && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">{option.shortcut}</span>
                      )}
                    </a>
                  )
                )}
              </MenuItem>
            )
          ))}
        </div>
      </MenuItems>
    </Menu>
  )
}

