import { useState } from 'react'

const propertyTypes = ['Any', 'Room', 'Annex', 'Apartment', 'House', 'Hostel']
const bedroomOptions = ['Any', '1+', '2+', '3+', '4+']
const bathroomOptions = ['Any', '1+', '2+', '3+']

export default function FilterSidebar({ onFiltersChange }) {
	const [propertyType, setPropertyType] = useState('Any')
	const [priceRange, setPriceRange] = useState(300000)
	const [bedrooms, setBedrooms] = useState('Any')
	const [bathrooms, setBathrooms] = useState('Any')
	const [furnished, setFurnished] = useState(false)
	const [parking, setParking] = useState(false)
	const [petAllowed, setPetAllowed] = useState(false)

	const emitFilters = (nextFilters) => {
		if (onFiltersChange) {
			onFiltersChange(nextFilters)
		}
	}

	const handleReset = () => {
		const defaultState = {
			propertyType: 'Any',
			maxPrice: 300000,
			bedrooms: 'Any',
			bathrooms: 'Any',
			furnished: false,
			parking: false,
			petAllowed: false,
		}
		setPropertyType('Any')
		setPriceRange(300000)
		setBedrooms('Any')
		setBathrooms('Any')
		setFurnished(false)
		setParking(false)
		setPetAllowed(false)
		emitFilters(defaultState)
	}

	const togglePreset = (type) => {
		let updated = {
			propertyType,
			maxPrice: priceRange,
			bedrooms,
			bathrooms,
			furnished,
			parking,
			petAllowed,
		}

		if (type === 'under25k') {
			const isAlreadyActive = priceRange === 25000
			const nextPrice = isAlreadyActive ? 300000 : 25000
			updated.maxPrice = nextPrice
			setPriceRange(nextPrice)
		} else if (type === 'room') {
			const isAlreadyActive = propertyType === 'Room'
			const nextType = isAlreadyActive ? 'Any' : 'Room'
			updated.propertyType = nextType
			setPropertyType(nextType)
		} else if (type === 'furnished') {
			const nextFurnished = !furnished
			updated.furnished = nextFurnished
			setFurnished(nextFurnished)
		}

		emitFilters(updated)
	}

	return (
		<aside className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-24 space-y-6">
			
			{/* Header with Title & Reset Button */}
			<div className="flex items-center justify-between pb-4 border-b border-slate-100">
				<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
					<span>🎛️</span> Filter Properties
				</h3>
				<button
					onClick={handleReset}
					className="text-xs font-bold text-[#3488c3] hover:underline cursor-pointer"
				>
					Reset All
				</button>
			</div>

			{/* Quick Preset Badges */}
			<div>
				<label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
					Quick Filters
				</label>
				<div className="flex flex-wrap gap-1.5">
					<button
						type="button"
						onClick={() => togglePreset('under25k')}
						className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
							priceRange === 25000
								? 'bg-[#3488c3] text-white border-[#3488c3] shadow-xs'
								: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
						}`}
					>
						⚡ Under 25k
					</button>
					<button
						type="button"
						onClick={() => togglePreset('room')}
						className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
							propertyType === 'Room'
								? 'bg-[#3488c3] text-white border-[#3488c3] shadow-xs'
								: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
						}`}
					>
						🚪 Single Rooms
					</button>
					<button
						type="button"
						onClick={() => togglePreset('furnished')}
						className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
							furnished
								? 'bg-[#3488c3] text-white border-[#3488c3] shadow-xs'
								: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
						}`}
					>
						🛋️ Furnished
					</button>
				</div>
			</div>

			{/* Property Type Dropdown */}
			<div>
				<label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
					Property Type
				</label>
				<select
					value={propertyType}
					onChange={(e) => {
						const nextValue = e.target.value
						setPropertyType(nextValue)
						emitFilters({
							propertyType: nextValue,
							maxPrice: priceRange,
							bedrooms,
							bathrooms,
							furnished,
							parking,
							petAllowed,
						})
					}}
					className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50 font-semibold outline-none focus:ring-2 focus:ring-[#3488c3] focus:bg-white transition cursor-pointer"
				>
					{propertyTypes.map((type) => (
						<option key={type} value={type}>
							{type === 'Any' ? 'Any Property Type' : type}
						</option>
					))}
				</select>
			</div>

			{/* Price Range Slider */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
						Max Budget
					</label>
					<span className="text-xs font-extrabold text-[#3488c3] bg-[#3488c3]/10 border border-[#3488c3]/20 px-2.5 py-0.5 rounded-full">
						Rs {priceRange.toLocaleString()}/mo
					</span>
				</div>
				<input
					type="range"
					min="10000"
					max="300000"
					step="5000"
					value={priceRange}
					onChange={(e) => {
						const nextValue = Number(e.target.value)
						setPriceRange(nextValue)
						emitFilters({
							propertyType,
							maxPrice: nextValue,
							bedrooms,
							bathrooms,
							furnished,
							parking,
							petAllowed,
						})
					}}
					className="w-full accent-[#3488c3] cursor-pointer"
				/>
				<div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
					<span>Rs 10k</span>
					<span>Rs 300k</span>
				</div>
			</div>

			{/* Bedrooms Pill Selector */}
			<div>
				<label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
					Bedrooms
				</label>
				<div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
					{bedroomOptions.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => {
								setBedrooms(opt)
								emitFilters({
									propertyType,
									maxPrice: priceRange,
									bedrooms: opt,
									bathrooms,
									furnished,
									parking,
									petAllowed,
								})
							}}
							className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
								bedrooms === opt
									? 'bg-[#3488c3] text-white shadow-xs'
									: 'text-slate-600 hover:text-slate-900'
							}`}
						>
							{opt}
						</button>
					))}
				</div>
			</div>

			{/* Bathrooms Pill Selector */}
			<div>
				<label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
					Bathrooms
				</label>
				<div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
					{bathroomOptions.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => {
								setBathrooms(opt)
								emitFilters({
									propertyType,
									maxPrice: priceRange,
									bedrooms,
									bathrooms: opt,
									furnished,
									parking,
									petAllowed,
								})
							}}
							className={`py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
								bathrooms === opt
									? 'bg-[#3488c3] text-white shadow-xs'
									: 'text-slate-600 hover:text-slate-900'
							}`}
						>
							{opt}
						</button>
					))}
				</div>
			</div>

			{/* Amenities Checkboxes */}
			<div>
				<label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
					Amenities & Features
				</label>
				<div className="space-y-2.5">
					<label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900 transition">
						<input
							type="checkbox"
							checked={furnished}
							onChange={(e) => {
								const nextValue = e.target.checked
								setFurnished(nextValue)
								emitFilters({
									propertyType,
									maxPrice: priceRange,
									bedrooms,
									bathrooms,
									furnished: nextValue,
									parking,
									petAllowed,
								})
							}}
							className="h-4 w-4 rounded border-slate-300 text-[#3488c3] focus:ring-[#3488c3] cursor-pointer"
						/>
						🛋️ Furnished
					</label>
					<label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900 transition">
						<input
							type="checkbox"
							checked={parking}
							onChange={(e) => {
								const nextValue = e.target.checked
								setParking(nextValue)
								emitFilters({
									propertyType,
									maxPrice: priceRange,
									bedrooms,
									bathrooms,
									furnished,
									parking: nextValue,
									petAllowed,
								})
							}}
							className="h-4 w-4 rounded border-slate-300 text-[#3488c3] focus:ring-[#3488c3] cursor-pointer"
						/>
						🚗 Parking Space
					</label>
					<label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900 transition">
						<input
							type="checkbox"
							checked={petAllowed}
							onChange={(e) => {
								const nextValue = e.target.checked
								setPetAllowed(nextValue)
								emitFilters({
									propertyType,
									maxPrice: priceRange,
									bedrooms,
									bathrooms,
									furnished,
									parking,
									petAllowed: nextValue,
								})
							}}
							className="h-4 w-4 rounded border-slate-300 text-[#3488c3] focus:ring-[#3488c3] cursor-pointer"
						/>
						🐾 Pets Allowed
					</label>
				</div>
			</div>

			{/* Apply Filters Action Button */}
			<button
				onClick={() => emitFilters({ propertyType, maxPrice: priceRange, bedrooms, bathrooms, furnished, parking, petAllowed })}
				className="w-full py-3 bg-[#3488c3] hover:bg-[#2978b3] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-[#3488c3]/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
			>
				<span>✨ Apply Filters</span>
			</button>
		</aside>
	)
}
