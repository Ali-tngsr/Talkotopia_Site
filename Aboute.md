# 📚 Language Course Sales & Online Classes Platform (LMS) 

## 🎯 Project Overview

[cite_start]This project is a Learning Management System (LMS) with an initial focus on the backend and performance optimization[cite: 80]. [cite_start]In educational platforms and online classes, server stability, proper request management, and response speed are of utmost importance[cite: 81]. [cite_start]The system is built upon a strong and optimized API, allowing the frontend to be easily connected later using any framework[cite: 82].

---

## 🛠 Backend & Storage Technology Stack

| Technology | Main Application | Reason for Selection |
| :--- | :--- | :--- |
| **NestJS / FastAPI** | Core Backend Framework | [cite_start]These are the most balanced options between development speed and extreme optimization for an LMS[cite: 84]. |
| **PostgreSQL** | Main Database | [cite_start]Used for storing user information, courses, financial transactions, and registrations[cite: 85]. [cite_start]Postgres is the most standard option due to its excellent support for complex transactions (ACID) and high speed in relational queries[cite: 86]. |
| **Redis** | In-Memory Database | [cite_start]It is crucial for optimization[cite: 87]. [cite_start]Use Redis for caching highly-visited course lists, managing sessions, and the Rate Limiting system to prevent attacks on registration[cite: 88]. |

---

## ⚙️ Core Architecture & Features

### 1. Integrated Authentication System
* [cite_start]**Implementation:** Using JWT (JSON Web Tokens) along with Access Token and Refresh Token mechanisms[cite: 89].
* [cite_start]**Stateless Management:** Manage tokens statelessly so there is no need to connect to the main database for every request[cite: 90].
* [cite_start]**Security:** Handle the revocation of compromised tokens via Redis[cite: 91].

### 2. Online Classes Infrastructure
* [cite_start]**Third-Party Integration:** You should use existing open-source services like BigBlueButton or Jitsi via API or Webhook[cite: 92].
* [cite_start]**Optimized Routing:** Your backend's only task is to generate entry tickets (Tokens), check user access (have they purchased the course?), and redirect them to the video server[cite: 93]. 
* [cite_start]**Efficiency:** This approach removes the burden of video processing from your main server[cite: 94].

### 3. Course Sales & Payment Gateway
* [cite_start]**API Endpoints:** Building API endpoints for order registration, connecting to a gateway (like ZarinPal or direct bank gateways), and verifying the transaction[cite: 95].
* [cite_start]**Data Integrity:** Use Database Transactions so that if an error occurs at any stage of the purchase, incomplete data is not saved (they are rolled back)[cite: 96].

---

## 🇮🇷 Intranet Resilience & Cost Optimization (Iran)

[cite_start]To ensure the site works without issues during international internet restrictions, the architecture is designed to be completely self-hosted and localized. The following strict rules are applied while keeping infrastructure costs minimal:

### Network & Hosting
* [cite_start]**Domestic Hosting:** All system components (backend, PostgreSQL database, Redis cache) must be hosted on data centers inside the country[cite: 110]. [cite_start]Avoid using foreign clouds like AWS or DigitalOcean[cite: 111].
* [cite_start]**Domain Strategy:** Use an `.ir` domain as the primary or mirror domain because international domains (like `.com`) might face routing issues[cite: 112, 113].
* [cite_start]**CDN & DNS:** Cloudflare stops working entirely during global internet outages[cite: 114]. [cite_start]Use domestic cloud providers and CDNs so traffic is routed properly on the national information network[cite: 115].

### Video Server Optimization (Cost vs. Ping)
* [cite_start]**Local Jitsi/BBB:** By configuring BigBlueButton or Jitsi on servers inside Iran, students and teachers will easily connect using local internet and experience very low ping[cite: 117, 118].
* **Cost Factor:** To avoid the high cost of dedicated video servers, integrate with affordable domestic API-based video class providers instead of hosting the heavy infrastructure entirely from scratch.

### Eliminating External Dependencies
* [cite_start]**Local Assets:** Do not use Google Fonts or foreign CDNs (like cdnjs) for CSS, JS, or icons[cite: 120]. [cite_start]All files must be downloaded and hosted on your own server[cite: 121].
* [cite_start]**CAPTCHA:** Using Google reCAPTCHA causes the site loading to stop during an outage[cite: 122]. [cite_start]You must use self-hosted CAPTCHAs or Iranian CAPTCHA services[cite: 123].
* [cite_start]**Gateways & SMS:** Iranian payment gateways (Shaparak) and SMS panels work on the intranet; as long as your server is in Iran, these APIs will respond without issues[cite: 124, 125].

### Deployment Preparedness
* [cite_start]**Offline Builds:** During an internet cut, your server cannot download new packages (NPM/PyPI) or Docker images from global repositories[cite: 126]. [cite_start]Be prepared to use internal registries or transfer built files directly to the server[cite: 127].

---

## 💻 Frontend Vision (Headless Approach)

* [cite_start]**API-First:** Build the system as Headless or API-First[cite: 101]. [cite_start]This means your backend is pure and only outputs JSON[cite: 102].
* [cite_start]**SEO Mastery:** Ultimately, for the frontend, you can go for options like Next.js[cite: 103]. [cite_start]Due to having SSR (Server-Side Rendering), the SEO of your course site will be exceptionally excellent[cite: 104].
