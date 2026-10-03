import { useState } from 'react'

const genderPreferences = ['Any', 'Male', 'Female']
const occupationOptions = ['Any', 'Student', 'Software Engineer', 'Accountant', 'Lawyer', 'Doctor', 'Teacher', 'Designer', 'Manager', 'Engineer', 'Nurse', 'Consultant', 'Freelancer', 'Other']
const roomTypeOptions = ['Any', 'Single room', 'Shared room', 'Apartment share']
const foodPreferences = ['Any', 'Vegetarian', 'Non-vegetarian']

export default function RoommateFilterSidebar({ onFiltersChange }) {
  const [budgetRange, setBudgetRange] = useState(80000)
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(65)
  const [location, setLocation] = useState('')
  const [genderPreference, setGenderPreference] = useState('Any')
  const [occupation, setOccupation] = useState('Any')
  const [roomType, setRoomType] = useState('Any')
  const [smokingPreference, setSmokingPreference] = useState(false)
  const [petFriendly, setPetFriendly] = useState(false)
  const [foodPreference, setFoodPreference] = useState('Any')

  const emitFilters = (nextFilters) => {
    if (onFiltersChange) {
      onFiltersChange(nextFilters)
    }
  }

  const handleReset = () => {
    const defaultState = {
      budgetRange: 80000,
      minAge: 18,
      maxAge: 65,
      location: '',
      genderPreference: 'Any',
      occupation: 'Any',
      roomType: 'Any',
      smokingPreference: false,
      petFriendly: false,
      foodPreference: 'Any',
    }
    setBudgetRange(80000)
    setMinAge(18)
    setMaxAge(65)
    setLocation('')
    setGenderPreference('Any')
    setOccupation('Any')
    setRoomType('Any')
    setSmokingPreference(false)
    setPetFriendly(false)
    setFoodPreference('Any')
    emitFilters(defaultState)
  }

  const togglePreset = (type) => {
    let updated = {
      budgetRange,
      minAge,
      maxAge,
      location,
      genderPreference,
      occupation,
      roomType,
      smokingPreference,
      petFriendly,
      foodPreference,
    }

    if (type === 'under25k') {
      const isAlreadyActive = budgetRange === 25000
      const nextBudget = isAlreadyActive ? 80000 : 25000
      updated.budgetRange = nextBudget
      setBudgetRange(nextBudget)
    } else if (type === 'student') {
      const isAlreadyActive = occupation === 'Student'
      const nextOcc = isAlreadyActive ? 'Any' : 'Student'
      updated.occupation = nextOcc
      setOccupation(nextOcc)
    } else if (type === 'female') {
      const isAlreadyActive = genderPreference === 'Female'
      const nextGender = isAlreadyActive ? 'Any' : 'Female'
      updated.genderPreference = nextGender
      setGenderPreference(nextGender)
    }

    emitFilters(updated)
  }

  return (
    <aside className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-24 space-y-6">
      {/* Header with Title & Reset Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span>🎛️</span> Filter Roommates
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-[#3488c3] hover:underline cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Quick Filter Presets */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => togglePreset('under25k')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
              budgetRange === 25000
                ? 'bg-[#3488c3] text-white border-[#3488c3] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
            }`}
          >
            ⚡ Under 25k
          </button>
          <button
            type="button"
            onClick={() => togglePreset('student')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
              occupation === 'Student'
                ? 'bg-[#3488c3] text-white border-[#3488c3] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
            }`}
          >
            🎓 Students
          </button>
          <button
            type="button"
            onClick={() => togglePreset('female')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
              genderPreference === 'Female'
                ? 'bg-[#3488c3] text-white border-[#3488c3] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
            }`}
          >
            👩 Females
          </button>
        </div>
      </div>

      {/* Location Search Input */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => {
            const nextValue = e.target.value
            setLocation(nextValue)
            emitFilters({
              budgetRange,
              minAge,
              maxAge,
              location: nextValue,
              genderPreference,
              occupation,
              roomType,
              smokingPreference,
              petFriendly,
              foodPreference,
            })
          }}
          placeholder="e.g. Colombo, Kandy, Galle"
          className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 font-semibold outline-none focus:ring-2 focus:ring-[#3488c3] focus:bg-white transition placeholder:text-slate-400"
        />
      </div>

      {/* Budget Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Max Budget
          </label>
          <span className="text-xs font-extrabold text-[#3488c3] bg-[#3488c3]/10 border border-[#3488c3]/20 px-2.5 py-0.5 rounded-full">
            LKR {budgetRange.toLocaleString()}/mo
          </span>
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
              minAge,
              maxAge,
              location,
              genderPreference,
              occupation,
              roomType,
              smokingPreference,
              petFriendly,
              foodPreference,
            })
          }}
          className="w-full accent-[#3488c3] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
          <span>LKR 10k</span>
          <span>LKR 150k</span>
        </div>
      </div>

      {/* Age Range Sliders */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Min Age</label>
            <span className="text-xs font-extrabold text-slate-900">{minAge}</span>
          </div>
          <input
            type="range"
            min="18"
            max="65"
            step="1"
            value={minAge}
            onChange={(e) => {
              const nextValue = Number(e.target.value)
              if (nextValue <= maxAge) {
                setMinAge(nextValue)
                emitFilters({
                  budgetRange,
                  minAge: nextValue,
                  maxAge,
                  location,
                  genderPreference,
                  occupation,
                  roomType,
                  smokingPreference,
                  petFriendly,
                  foodPreference,
                })
              }
            }}
            className="w-full accent-[#3488c3] cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Max Age</label>
            <span className="text-xs font-extrabold text-slate-900">{maxAge}</span>
          </div>
          <input
            type="range"
            min="18"
            max="65"
            step="1"
            value={maxAge}
            onChange={(e) => {
              const nextValue = Number(e.target.value)
              if (nextValue >= minAge) {
                setMaxAge(nextValue)
                emitFilters({
                  budgetRange,
                  minAge,
                  maxAge: nextValue,
                  location,
                  genderPreference,
                  occupation,
                  roomType,
                  smokingPreference,
                  petFriendly,
                  foodPreference,
                })
              }
            }}
            className="w-full accent-[#3488c3] cursor-pointer"
          />
        </div>
      </div>

      {/* Gender Preference */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
          Gender Preference
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {genderPreferences.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setGenderPreference(option)
                emitFilters({
                  budgetRange,
                  minAge,
                  maxAge,
                  location,
                  genderPreference: option,
                  occupation,
                  roomType,
                  smokingPreference,
                  petFriendly,
                  foodPreference,
                })
              }}
              className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                genderPreference === option
                  ? 'bg-[#3488c3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Occupation Dropdown */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
          Occupation
        </label>
        <select
          value={occupation}
          onChange={(e) => {
            const nextValue = e.target.value
            setOccupation(nextValue)
            emitFilters({
              budgetRange,
              minAge,
              maxAge,
              location,
              genderPreference,
              occupation: nextValue,
              roomType,
              smokingPreference,
              petFriendly,
              foodPreference,
            })
          }}
          className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 font-semibold outline-none focus:ring-2 focus:ring-[#3488c3] focus:bg-white transition cursor-pointer"
        >
          {occupationOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Lifestyle Preferences Checkboxes */}
      <div>
        <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
          Lifestyle Preferences
        </label>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900 transition">
            <input
              type="checkbox"
              checked={smokingPreference}
              onChange={(e) => {
                const nextValue = e.target.checked
                setSmokingPreference(nextValue)
                emitFilters({
                  budgetRange,
                  minAge,
                  maxAge,
                  location,
                  genderPreference,
                  occupation,
                  roomType,
                  smokingPreference: nextValue,
                  petFriendly,
                  foodPreference,
                })
              }}
              className="h-4 w-4 rounded border-slate-300 text-[#3488c3] focus:ring-[#3488c3] cursor-pointer"
            />
            🚬 Smoking Allowed
          </label>
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900 transition">
            <input
              type="checkbox"
              checked={petFriendly}
              onChange={(e) => {
                const nextValue = e.target.checked
                setPetFriendly(nextValue)
                emitFilters({
                  budgetRange,
                  minAge,
                  maxAge,
                  location,
                  genderPreference,
                  occupation,
                  roomType,
                  smokingPreference,
                  petFriendly: nextValue,
                  foodPreference,
                })
              }}
              className="h-4 w-4 rounded border-slate-300 text-[#3488c3] focus:ring-[#3488c3] cursor-pointer"
            />
            🐾 Pet Friendly
          </label>
        </div>
      </div>

      {/* Apply Filters Action Button */}
      <button
        type="button"
        onClick={() => emitFilters({ budgetRange, minAge, maxAge, location, genderPreference, occupation, roomType, smokingPreference, petFriendly, foodPreference })}
        className="w-full py-3 bg-[#3488c3] hover:bg-[#2978b3] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#3488c3]/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span>✨ Apply Filters</span>
      </button>
    </aside>
  )
}
