# DormSync Scanner Dashboard

This document provides a comprehensive overview of the features and interfaces of the DormSync Scanner Dashboard web application. It is designed to serve as a reference guide for migrating or replicating the application in Next.js.

## 1. Authentication (Login Interface)
The application secures access through a robust authentication system.
*   **Traditional Login**: Username and password authentication using credentials stored securely in environment variables.
*   **Google Sign-In**: Integration with Google Auth for quick and secure access using university/authorized Google accounts.
*   **Session Management**: Automatic session tracking with a configurable timeout (default 30 minutes) to ensure security for inactive users.

## 2. Data Integration & Processing
The application acts as a front-end consumer of static and dynamic data sources.
*   **CSV Data Fetching**: Retrieves `scan_log.csv` and `allotments.csv` from configured URLs.
*   **GitHub Integration**: Capable of securely fetching data directly from private GitHub repositories using a Personal Access Token (PAT).
*   **Live Arrears Sync**: Fetches real-time financial arrears data directly from a public Google Sheet, merging it with the local allotments data dynamically.

## 3. Dashboard Interface
The primary landing page providing a bird's-eye view of recent scanning activity.
*   **Key Statistics**: Quick glance cards showing Total Scans, Unique Scans, Boarders vs. Non-Boarders, and Invalid Entries.
*   **Last Scan Banner**: Highlights the exact timestamp of the most recent activity.
*   **Advanced Filtering**: 
    *   Toggle between "All Entries" and "Unique Entries".
    *   Filter by a custom "Date Range".
    *   Search by Name or Roll Number.
    *   Toggle visibility of "Invalid" entries.
*   **View Modes**: Toggle between a dense "List View" (table) and a visual "Grid View" (cards) for scan logs.
*   **Detailed Log Modal**: Clicking on any scan record opens an `ImageModal` displaying the associated student's details and captured image.

## 4. Students Interface
A comprehensive directory of all students allotted to the hostels.
*   **Student Directory**: A responsive grid layout displaying student cards with quick details (Name, Roll No, Hostel, Room, Contact).
*   **Interactive Filters**: Dropdowns to filter students by specific Hostels and Rooms.
*   **Arrears Management**:
    *   **Live Arrears Toggle**: A button to fetch and merge live arrears data from Google Sheets.
    *   **Arrears Filter**: Quickly filter the list to show only students with pending arrears.
*   **Detailed Student Profile**: Clicking a student card opens a detailed modal showing comprehensive information including Department, Degree Level, Mess Status, CNIC, Primary/Secondary Emails, and exact Location/Address.
*   **Fullscreen Image Viewer**: Profile avatars can be clicked to view them in high resolution using the `FullscreenImageViewer`.

## 5. Reports Interface
A dedicated section for generating and downloading professional activity reports.
*   **Quick Reports**: One-click generation for "Daily Report", "Weekly Report", and "Monthly Report".
*   **Custom Date Range**: A calendar picker to generate reports for any specific timeframe.
*   **Unique vs. All Prompt**: Before downloading, the system asks the user whether to include all scans or deduplicate to only show unique records.
*   **Professional HTML Export**: Generates an aesthetically pleasing, print-ready HTML file containing:
    *   A professional header with dynamic date labels.
    *   A summary bar with key metrics (Total Scans, Boarders, Late Entries).
    *   A meticulously styled, responsive data table.

## 6. Global Features & Layout
*   **Mobile Responsiveness**: Uses a custom `AppShell` with a collapsible sidebar and mobile-optimized search/filter modals to ensure full functionality on small screens.
*   **Toast Notifications**: Real-time feedback for user actions (e.g., successful login, data loaded, filter applied, report downloaded).
*   **Theming**: Full support for both Light and Dark modes.
