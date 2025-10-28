import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

export default function UserForm({ user, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'Normal User'
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role
      })
    } else {
      reset({
        name: '',
        email: '',
        role: 'Normal User'
      })
    }
  }, [user, reset])

  const handleFormSubmit = (data) => {
    try {
      onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
      alert(`Form submission failed: ${error.message}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          {...register('name', { 
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })}
          className={`w-full px-4 py-2 border rounded-md ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className={`w-full px-4 py-2 border rounded-md ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          {...register('role', { required: 'Role is required' })}
          className={`w-full px-4 py-2 border rounded-md ${
            errors.role ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="Normal User">Normal User</option>
          <option value="Technical User">Technical User</option>
          <option value="Technical Supervisor">Technical Supervisor</option>
          <option value="System Admin">System Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            {...register('password', { 
              required: !user ? 'Password is required' : false,
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            className={`w-full px-4 py-2 border rounded-md ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter password for new user"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}