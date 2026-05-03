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
		<aside className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm lg:sticky lg:top-24">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Properties</h3>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
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
						className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						{propertyTypes.map((type) => (
							<option key={type} value={type}>{type}</option>
						))}
					</select>
				</div>

				<div>
					<div className="flex items-center justify-between mb-1">
						<label className="text-sm font-medium text-gray-700">Min price</label>
						<label className="text-sm font-medium text-gray-700">Max price</label>
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
						className="w-full accent-blue-600"
					/>
					<p className="text-sm text-gray-600 mt-1">Up to Rs {priceRange.toLocaleString()}</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
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
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{bedroomOptions.map((option) => (
								<option key={option} value={option}>{option}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
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
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{bathroomOptions.map((option) => (
								<option key={option} value={option}>{option}</option>
							))}
						</select>
					</div>
				</div>

				<div className="space-y-2 pt-1">
					<label className="flex items-center gap-2 text-sm text-gray-700">
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
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						Furnished
					</label>
					<label className="flex items-center gap-2 text-sm text-gray-700">
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
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						Parking
					</label>
					<label className="flex items-center gap-2 text-sm text-gray-700">
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
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						Pet allowed
					</label>
				</div>


			</div>
		</aside>
	)
}
