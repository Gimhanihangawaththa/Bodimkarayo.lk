import { useState } from 'react'

const genderPreferences = ['Any', 'Male', 'Female']
const occupationOptions = ['Any', 'Student', 'Employee', 'Other']
const roomTypeOptions = ['Any', 'Single room', 'Shared room', 'Apartment share']
const foodPreferences = ['Any', 'Vegetarian', 'Non-vegetarian']

export default function RoommateFilterSidebar({ onFiltersChange }) {
  
  const [budgetRange, setBudgetRange] = useState(80000)
  const [genderPreference, setGenderPreference] = useState('Any')
  const [occupation, setOccupation] = useState('Any')
  const [universityOrWorkplace, setUniversityOrWorkplace] = useState('')
  const [roomType, setRoomType] = useState('Any')
  const [smokingPreference, setSmokingPreference] = useState(false)
  const [petFriendly, setPetFriendly] = useState(false)
  const [foodPreference, setFoodPreference] = useState('Any')

  const emitFilters = (nextFilters) => {
    if (onFiltersChange) {
      onFiltersChange(nextFilters)
    }
  }

  return (
    <aside className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm lg:sticky lg:top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Roommates</h3>

      <div className="space-y-4">
        

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Min budget</label>
            <label className="text-sm font-medium text-gray-700">Max budget</label>
          </div>
          <input
            type="range"
            min="10000"
            max="150000"
            step="2500"
            value={budgetRange}
            onChange={(e) => {
              const nextValue = Number(e.target.value)
              setBudgetRange(nextValue)
              emitFilters({
                budgetRange: nextValue,
                genderPreference,
                occupation,
                universityOrWorkplace,
                roomType,
                smokingPreference,
                petFriendly,
                foodPreference,
              })
            }}
            className="w-full accent-blue-600"
          />
          <p className="text-sm text-gray-600 mt-1">Up to LKR {budgetRange.toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender preference</label>
          <select
            value={genderPreference}
            onChange={(e) => {
              const nextValue = e.target.value
              setGenderPreference(nextValue)
              emitFilters({
                budgetRange,
                genderPreference: nextValue,
                occupation,
                universityOrWorkplace,
                roomType,
                smokingPreference,
                petFriendly,
                foodPreference,
              })
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {genderPreferences.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
          <select
            value={occupation}
            onChange={(e) => {
              const nextValue = e.target.value
              setOccupation(nextValue)
              emitFilters({
                budgetRange,
                genderPreference,
                occupation: nextValue,
                universityOrWorkplace,
                roomType,
                smokingPreference,
                petFriendly,
                foodPreference,
              })
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {occupationOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">University/Workplace</label>
          <input
            type="text"
            value={universityOrWorkplace}
            onChange={(e) => {
              const nextValue = e.target.value
              setUniversityOrWorkplace(nextValue)
              emitFilters({
                budgetRange,
                genderPreference,
                occupation,
                universityOrWorkplace: nextValue,
                roomType,
                smokingPreference,
                petFriendly,
                foodPreference,
              })
            }}
            placeholder="e.g. University of Moratuwa"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room type preference</label>
          <select
            value={roomType}
            onChange={(e) => {
              const nextValue = e.target.value
              setRoomType(nextValue)
              emitFilters({
                budgetRange,
                genderPreference,
                occupation,
                universityOrWorkplace,
                roomType: nextValue,
                smokingPreference,
                petFriendly,
                foodPreference,
              })
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {roomTypeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={smokingPreference}
              onChange={(e) => {
                const nextValue = e.target.checked
                setSmokingPreference(nextValue)
                emitFilters({
                  budgetRange,
                  genderPreference,
                  occupation,
                  universityOrWorkplace,
                  roomType,
                  smokingPreference: nextValue,
                  petFriendly,
                  foodPreference,
                })
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Smoking preference
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={petFriendly}
              onChange={(e) => {
                const nextValue = e.target.checked
                setPetFriendly(nextValue)
                emitFilters({
                  budgetRange,
                  genderPreference,
                  occupation,
                  universityOrWorkplace,
                  roomType,
                  smokingPreference,
                  petFriendly: nextValue,
                  foodPreference,
                })
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Pet friendly
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Food preference</label>
          <select
            value={foodPreference}
            onChange={(e) => {
              const nextValue = e.target.value
              setFoodPreference(nextValue)
              emitFilters({
                budgetRange,
                genderPreference,
                occupation,
                universityOrWorkplace,
                roomType,
                smokingPreference,
                petFriendly,
                foodPreference: nextValue,
              })
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {foodPreferences.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

      </div>
    </aside>
  )
}
