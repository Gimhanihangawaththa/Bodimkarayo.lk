# Global Search Feature - Implementation Guide

## Overview
A comprehensive global search feature that allows users to search across both properties and roommates simultaneously using Elasticsearch. The system returns grouped results for each category.

## Architecture

### Backend Components

#### 1. GlobalSearchService.java
**Location:** `backend/src/main/java/com/bodimkarayo/backend/service/GlobalSearchService.java`

**Functionality:**
- Searches both properties and roommates using Elasticsearch indices
- Returns results grouped by category
- Implements fuzzy matching across relevant fields

**Key Methods:**
- `globalSearch(String keyword)` - Main search method
  - Returns Map with "properties" and "roommates" keys
  - Input: Keyword string (any text)
  - Output: Grouped results

- `searchProperties(String keyword)` - Property search
  - Searches: title, description, location, address, propertyType
  
- `searchRoommates(String keyword)` - Roommate search
  - Searches: gender, occupation, location, bio, about, interests, preferredLocation, poster name/email

#### 2. GlobalSearchController.java
**Location:** `backend/src/main/java/com/bodimkarayo/backend/controller/GlobalSearchController.java`

**REST Endpoint:**
```
GET /api/search/global?keyword=<search_term>
```

**Response Example:**
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Modern Apartment in Galle",
      "location": "Galle",
      "rent": 50000,
      "bedrooms": 2,
      "bathrooms": 1,
      ...
    }
  ],
  "roommates": [
    {
      "id": 1,
      "gender": "Male",
      "age": 25,
      "location": "Galle",
      "occupation": "Software Engineer",
      ...
    }
  ]
}
```

### Frontend Components

#### 1. searchService.js
**Location:** `frontend/src/services/searchService.js`

**Purpose:** API client for global search

**Key Method:**
```javascript
searchService.globalSearch(keyword) 
// Returns: Promise<{properties: [], roommates: []}>
```

#### 2. SearchResults.jsx
**Location:** `frontend/src/pages/SearchResults.jsx`

**Features:**
- Full-page search interface with hero section
- Real-time search query parameter handling
- Grouped results display
  - Properties section with cards showing: image, title, location, rent, bedrooms, bathrooms
  - Roommates section with cards showing: avatar, name, age, occupation, location, budget
- Loading states
- Empty state handling with helpful messages
- Responsive grid layout
- Click-through navigation to detail pages

**Routes:**
- Search page: `/search?keyword=<term>`
- Result click navigation:
  - Properties: `/property/:propertyId`
  - Roommates: `/roommate/:roommateId`

### Integration Points

#### Header Component
Updated `frontend/src/components/Header.jsx`:
- Search submit now navigates to `/search?keyword=...`
- Works globally from any page

#### App Routing
Updated `frontend/src/App.jsx`:
- Added route: `<Route path="search" element={<SearchResults />} />`

## How to Use

### For Users
1. Click the search bar in the header (any page)
2. Enter a keyword (e.g., "Galle", "Software Engineer", "3 bedroom")
3. Press Enter or click Search
4. View grouped results for properties and roommates
5. Click any result to view detailed information

### Search Fields Indexed

**Properties:**
- Title
- Description
- Location
- Address
- Property Type

**Roommates:**
- Gender
- Occupation
- Location
- Bio
- About
- Interests
- Preferred Location
- Poster Name
- Poster Email

## Example Searches
- `"Galle"` - Shows all properties and roommates in Galle
- `"Software Engineer"` - Shows roommates with this occupation + matching properties
- `"3 bedroom"` - Shows 3-bedroom properties + related content
- `"Colombo apartment"` - Shows apartments in Colombo

## Technical Details

### Elasticsearch Integration
- Uses Spring Data Elasticsearch
- Property Index: `properties`
- Roommate Index: `roommates`
- Automatically synced via `SearchIndexService` on startup

### Performance
- Searches across indexed documents (fast)
- Falls back to in-memory filtering if Elasticsearch is unavailable
- Results are grouped and organized for better UX

### Error Handling
- Graceful error handling with fallback to empty results
- User-friendly error messages
- Loading states for async operations

## Future Enhancements
1. Advanced filtering on results page
2. Sorting options (relevance, price, date)
3. Saved searches
4. Search suggestions/autocomplete
5. Pagination for large result sets
6. Search analytics
