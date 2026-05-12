import { useState } from 'react'

const propertyTypes = ['Any', 'Room', 'Annex', 'Apartment', 'House', 'Hostel']
const bedroomOptions = ['Any', '1+', '2+', '3+', '4+']
const bathroomOptions = ['Any', '1+', '2+', '3+']

export default function FilterSidebar({ onFiltersChange }) {
	const [propertyType, setPropertyType] = useState('Any')
	const [priceRange, setPriceRange] = useState(150000)
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



	return (
		<aside className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-24">
			<h3 className="text-lg font-semibold text-gray-900 mb-6">Filter Properties</h3>

			<div className="space-y-6">
				<div>
					<label className="block text-sm font-semibold text-slate-700 mb-2">Property Type</label>
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
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-gray-900 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
					>
						{propertyTypes.map((type) => (
							<option key={type} value={type}>{type}</option>
						))}
					</select>
				</div>

				<div>
					<div className="flex items-center justify-between mb-2">
						<label className="text-sm font-semibold text-slate-700">Price Range</label>
						<span className="text-sm font-semibold text-blue-600">Rs {priceRange.toLocaleString()}</span>
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
						className="w-full accent-blue-600 cursor-pointer"
					/>
					<p className="text-xs text-slate-500 mt-2">Adjust the slider to set your budget</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
					<div>
						<label className="block text-sm font-semibold text-slate-700 mb-2">Bedrooms</label>
						<select
							value={bedrooms}
							onChange={(e) => {
								const nextValue = e.target.value
								setBedrooms(nextValue)
								emitFilters({
									propertyType,
									maxPrice: priceRange,
									bedrooms: nextValue,
									bathrooms,
									furnished,
									parking,
									petAllowed,
								})
							}}
							className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-gray-900 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
						>
							{bedroomOptions.map((option) => (
								<option key={option} value={option}>{option}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-semibold text-slate-700 mb-2">Bathrooms</label>
						<select
							value={bathrooms}
							onChange={(e) => {
								const nextValue = e.target.value
								setBathrooms(nextValue)
								emitFilters({
									propertyType,
									maxPrice: priceRange,
									bedrooms,
									bathrooms: nextValue,
									furnished,
									parking,
									petAllowed,
								})
							}}
							className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-gray-900 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
						>
							{bathroomOptions.map((option) => (
								<option key={option} value={option}>{option}</option>
							))}
						</select>
					</div>
				</div>

				<div className="space-y-2 pt-1">
					<label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition">
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
							className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
						/>
						Furnished
					</label>
					<label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition">
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
							className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
						/>
						Parking
					</label>
					<label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition">
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
							className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
						/>
						Pet allowed
					</label>
				</div>


			</div>
		</aside>
	)
}
