# Frontend API Integration - Quick Guide

## ✅ What's Been Set Up

Your frontend is now ready to connect with the backend! Here's what's configured:

### 1. **Axios Installed**
HTTP client for making API requests to the backend.

### 2. **API Configuration** (`src/config/api.config.js`)
- Base URL: `http://localhost:8080/api` (configurable in `.env`)
- Request/response interceptors for error handling
- Authentication support (ready for future use)
- Console logging for debugging

### 3. **API Services** (`src/services/`)
- **propertyService.js** - All property-related API calls
- **reviewService.js** - All review-related API calls
- **index.js** - Clean imports for components

### 4. **Updated Components**
- **AddProperty.jsx** - Now sends data to backend API
- **PropertyView.jsx** - Fetches property and review data from backend API

## 🚀 How to Use

### In Your Components:

```jsx
import { propertyService, reviewService } from '../services';

// Create a property
const newProperty = await propertyService.createProperty(formData);

// Get a property
const property = await propertyService.getPropertyById(id);

// Add a review
const review = await reviewService.createReview(propertyId, reviewData);
```

## 📋 For Your Backend Team Member

Share the `BACKEND_API_REQUIREMENTS.md` file with your backend developer. It contains:
- All required API endpoints
- Request/response formats
- Data models
- CORS configuration
- File upload handling

## 🔧 Configuration

### Change Backend URL:
Edit `frontend/.env`:
```
VITE_API_BASE_URL=http://your-backend-url/api
```

### During Development:
The frontend will:
- Log all API requests/responses to console
- Show error messages to users
- Use sample data as fallback (in PropertyView) if backend is not ready

## 🧪 Testing

1. **Without Backend** (Current State):
   - AddProperty will try to connect but show error (expected)
   - PropertyView will fall back to sample data (works for testing UI)

2. **With Backend Ready**:
   - Start backend: `cd backend && ./mvnw spring-boot:run`
   - Start frontend: `cd frontend && npm run dev`
   - Test creating properties and viewing them

## 📝 Next Steps

1. ✅ Frontend is ready to connect
2. ⏳ Wait for backend developer to implement API endpoints
3. 📤 Share `BACKEND_API_REQUIREMENTS.md` with backend developer
4. 🧪 Test integration when backend is ready
5. 🐛 Debug any issues using browser console logs

## 🛠️ Files Created/Modified

```
frontend/
├── .env                          # API base URL configuration
├── src/
│   ├── config/
│   │   └── api.config.js        # Axios instance & interceptors
│   ├── services/
│   │   ├── index.js             # Service exports
│   │   ├── propertyService.js   # Property API calls
│   │   └── reviewService.js     # Review API calls
│   └── pages/
│       ├── AddProperty.jsx      # ✏️ Updated with API integration
│       └── PropertyView.jsx     # ✏️ Updated with API integration
```

## 💡 Tips

- Check browser console for API request logs
- Error messages will guide you if something goes wrong
- The backend must enable CORS (see BACKEND_API_REQUIREMENTS.md)
- Images are sent as FormData (multipart/form-data)
- Arrays are sent as JSON strings (backend should parse them)

## ❓ Common Issues

### "Network Error" or "Backend may be offline"
→ Backend is not running or CORS is not configured

### "404 Not Found"
→ Backend endpoint doesn't exist or URL is wrong

### "500 Server Error"
→ Backend has an error (check backend logs)

---

Your frontend is production-ready for backend integration! 🎉
