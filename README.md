# Form-Sheets Integration

This project demonstrates a seamless integration between a contact form and Google Sheets using Netlify serverless functions. It allows users to submit their details through a simple web form, and the data is automatically stored in a connected Google Sheet for easy access and management.

## Project Overview

The goal of this project is to create a lightweight, efficient, and scalable solution for handling form submissions without needing a traditional backend. By leveraging Netlify Functions and the Google Sheets API, the form data is captured securely and stored in real time.

## Features

- Contact form with fields for Name, Email, and Message  
- Automatic storage of submissions in Google Sheets  
- Serverless backend powered by Netlify Functions  
- Lightweight and responsive frontend design  
- Secure authentication using a Google Service Account  

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js with Netlify Functions  
- **Database:** Google Sheets (via Google Sheets API)  
- **Hosting:** Netlify  
- **Version Control:** Git & GitHub  

## Project Structure
functions/ → Netlify serverless functions
public/ → Frontend (HTML form, styles, JS)
.env → Environment variables (not committed)
netlify.toml → Netlify config

## Output
Here’s how it looks:  

![Form Screenshot] (https://drive.google.com/file/d/1GZuohTtvnKpWI9c6qL3Y0X_OyrQHDx9k/view?usp=drive_link)

_The form submits data directly into a Google Sheet like this:_  

![Google Sheet Screenshot](https://drive.google.com/file/d/1fyqZsBhuuRnFphuNBeFER8cxxX2WZ9sX/view?usp=sharing)

##  How to Run
1. Clone this repo:
   ```bash
   git clone https://github.com/taskeen5/form-sheets-integration.git
2. Add your Google credentials in .env
3. Deploy on Netlify or run locally with:
   netlify dev

