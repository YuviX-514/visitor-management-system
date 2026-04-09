'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User, Building2, Mail, Phone } from 'lucide-react'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Employee {
  _id: string
  fullName: string
  employeeId: string
  email: string
  department: string
  phoneNumber: string
  photoUrl?: string
  displayText: string
}

interface EmployeeAutocompleteProps {
  value: string
  onSelect: (employee: Employee) => void
  placeholder?: string
}

export default function EmployeeAutocomplete({
  value,
  onSelect,
  placeholder = 'Search by name, ID, or department...',
}: EmployeeAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchEmployees = async () => {
      if (query.length < 2) {
        setEmployees([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setEmployees(data.employees)
          setShowDropdown(data.employees.length > 0)
        }
      } catch (error) {
        console.error('Employee search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchEmployees, 300)
    return () => clearTimeout(debounce)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (employee: Employee) => {
    setQuery(employee.displayText)
    onSelect(employee)
    setShowDropdown(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <InputGroup>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <InputGroupInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => employees.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="pl-9"
        />
      </InputGroup>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="max-h-[300px] overflow-auto p-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : employees.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No employees found
              </div>
            ) : (
              employees.map((employee) => (
                <button
                  key={employee._id}
                  onClick={() => handleSelect(employee)}
                  className="flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={employee.photoUrl} alt={employee.fullName} />
                    <AvatarFallback>
                      {employee.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {employee.fullName}
                      </span>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary">
                        {employee.employeeId}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      {employee.phoneNumber && employee.phoneNumber !== 'N/A' && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{employee.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
