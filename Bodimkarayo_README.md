# Bodimkarayo 🏠

**Smart Roommate & Property Finder Platform**  


---

## 📘 Project Overview

**Bodimkarayo** is a smart digital platform designed to simplify the process of finding rooms, properties, and compatible roommates, focusing on the Sri Lankan rental and boarding culture (“bodima”).  

The platform will connect tenants, landlords, and potential roommates through an intelligent recommendation system, verified profiles, and map-based property listings.

## Objectives
- Develop a user-friendly platform for property listing and roommate finding.
- Integrate search and personalized recommendations.
- Enable property owners and tenants to create verified profiles.
- Map Integration – Map-based property search and navigation
- Provide an admin dashboard for management, reporting, and issue handling.
- Deliver first a fully functional web application, followed by a mobile application built
  with Flutter for broader accessibility.

##  System Architecture (High-Level)

Frontend (React + Tailwind CSS)  
⇄ Backend (Spring Boot REST API)  
⇄ Database (MariaDB)  
⇅ ElasticSearch (for fast property search)  
⇅ Cloudinary (for media storage)  
⇅ AWS (for deployment and hosting)

---

## 🗂️ Folder Structure Plan

```
bodimkarayo/
│
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/bodimkarayo/
│   ├── src/main/resources/
│   └── pom.xml
│
├── frontend/                 # React Web Frontend
│   ├── src/pages/
│   ├── src/components/
│   └── package.json
│
├── docs/                     # Reports, proposals, diagrams
│
└── README.md
```

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React.js, Tailwind CSS, Leaflet.js |
| Backend | Spring Boot (Java) |
| Database | MariaDB |
| Search Engine | ElasticSearch |
| Storage | Cloudinary |
| Hosting | AWS (EC2, RDS, S3) |
| Version Control | GitHub |
| Testing | JUnit, Cypress / Selenium |
| CI/CD | GitHub Actions, SonarQube |

---

## 🧑‍🤝‍🧑 Team Members

| Member| Name |
|-------|-------------|
| Member 1 | Senuja Bodhinayake |
| Member 2 | Thamindu Dambewela | 
| Member 3 | Dushan Senith | 
| Member 4 | Gimhani Hangawaththa | 

---

## 🎨 Figma Design

You can view our interface designs on Figma:  
🔗 [[Figma Link Here](https://www.figma.com/design/n9Z5hYrIfyWAnvATHLYb9M/Bordimkarayo.lk?node-id=0-1&t=Z3Nk3LqGJwWJyRlq-1)]

---

## 🚀 Next Sprint Goals (Sprint 2)

- Implement authentication module (login/signup) with backend  
- Connect frontend UI with REST API  
- Develop basic property CRUD operations  
- Integrate Cloudinary for image uploads  
- Establish ElasticSearch for property search

---

📅 *Last Updated: October 26, 2025*
