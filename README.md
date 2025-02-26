# GST Assistant: Intelligent Tax Management Platform

## Overview
The GST Assistant is a cutting-edge, user-friendly web application designed to revolutionize Goods and Services Tax (GST) management for businesses of all sizes. By leveraging modern technologies, it simplifies tax compliance, automates invoice reconciliation, and provides real-time analytics to ensure businesses stay ahead of deadlines and regulations. This project is a game-changer for small and medium enterprises, reducing manual effort and minimizing compliance risks. We can easily upload pdf vs as images and get gst data in json format and then upload directly in gst portal.

## Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Outputs](#outputs)
- [Future Vision](#future-vision)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Directory Structure](#directory-structure)

## Features
The GST Assistant offers a suite of innovative features to streamline GST processes:

- **Real-Time GST Analytics Dashboard**: Instantly visualize total tax liability, input tax credit, and pending refunds with percentage change insights.
- **Dynamic Tax Estimator**: Calculate GST liability based on business income and expenses, empowering accurate financial planning.
- **Seamless Invoice Upload & Processing**: Drag-and-drop interface for uploading invoices, ensuring quick processing and integration.
- **Automated ITC Reconciliation**: Match purchase and sales invoices to claim Input Tax Credit accurately, reducing errors.
- **Step-by-Step Filing Assistant**: Guide users through preparing and filing GST returns (e.g., GSTR-1, GSTR-3B) with ease.
- **Proactive Compliance Checker**: Detect and resolve compliance issues automatically, preventing penalties and ensuring regulatory adherence.
- **Smart Tax Deduction Suggestions**: Leverage data-driven insights to optimize tax savings and improve financial efficiency.

## Screenshots
Explore the intuitive interface of the GST Assistant:

1. **GST Updates & Notifications**

   ![GST Updates](/project/4.png)  
   *Displays critical deadlines and the latest GST news.*

2. **GST Analytics Dashboard**
 
   ![Analytics Dashboard](/project/1.png)  
   *Shows real-time financial metrics.*

3. **Tax Estimator & Invoice Upload**
   
   ![Tax Estimator](/project/1.png)  
   *Features a tax estimator and intuitive invoice upload.*

4. **ITC Reconciliation & Compliance Checker**
   
   ![Compliance Checker](/project/3.png)  
   *Highlights reconciled invoices and compliance alerts.*

## Inputs:
![Compliance Checker](/project/5.png) 


![Compliance Checker](/project/6.png) 


## Outputs
The GST Assistant generates actionable outputs in Excel and JSON formats.

### Excel Output Sample
![Compliance Checker](/project/7.png)  
[Download Excel Output](path/to/excel-file.xlsx)

### JSON Output Sample
```json
{
  "gstin": "YOUR_GSTIN_HERE",
  "fp": "022025",
  "b2b": [
    {
      "inv": [
        {
          "inum": "80XBoEZ0-8BP000",
          "idt": "",
          "val": 50500.0,
          "pos": "07",
          "rchrg": "N",
          "etin": "",
          "inv_typ": "R",
          "itms": [
            {
              "num": 1,
              "itm_det": {
                "rt": 18,
                "txval": 42796.61,
                "iamt": 7703.39,
                "camt": 0.0,
                "samt": 0.0,
                "csamt": 0.0
              }
            }
          ]
        },
        {
          "inum": "80XBoEZ0-8BP000",
          "idt": "26-02-2025",
          "val": 15953.44,
          "pos": "07",
          "rchrg": "N",
          "etin": "",
          "inv_typ": "R",
          "itms": [
            {
              "num": 1,
              "itm_det": {
                "rt": 9.0,
                "txval": 6871.943310362762,
                "iamt": 0.0,
                "camt": 434.52,
                "samt": 434.52,
                "csamt": 0.0
              }
            },
            {
              "num": 2,
              "itm_det": {
                "rt": 2.5,
                "txval": 3862.028344818619,
                "iamt": 0.0,
                "camt": 244.2,
                "samt": 244.2,
                "csamt": 0.0
              }
            },
            {
              "num": 3,
              "itm_det": {
                "rt": 2.5,
                "txval": 3862.028344818619,
                "iamt": 0.0,
                "camt": 244.2,
                "samt": 244.2,
                "csamt": 0.0
              }
            }
          ]
        }
      ]
    }
  ]
}
```
[Download JSON Output](path/to/json-file.json)

## Future Vision
The GST Assistant aims to redefine tax management with innovations such as:
- **AI-Powered Predictive Analytics**
- **Global Tax Compliance Expansion**
- **Mobile-First Experience**
- **Collaborative Workspaces**
- **Blockchain-Enhanced Security**
- **Voice-Activated Interface**
- **Sustainability Integration**

## Installation
```bash
git clone https://github.com/your-username/gst-assistant.git
cd gst-assistant
npm install
npm start
```
Access the app at http://localhost:5173.

## Usage
- Log in and navigate through Dashboard, Returns, Calculator, and Settings.
- Upload invoices, reconcile them, and file returns.
- Monitor compliance and apply tax-saving suggestions.
- Directky extract data from images or pdf to json and excel files to prevent manual filling of data.

## Technologies Used
- **Frontend**: React.js, Vite, Tailwind CSS
- **UI/UX**: React Components, Figma
- **Backend**: Node.js, Express.js (if applicable)
- **Database**: MongoDB/PostgreSQL
- **APIs**: RESTful services
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel/Netlify

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make changes and commit:
   ```bash
   git commit -m "Add feature"
   ```
4. Push and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
- **Author**: [Yash Sharma]
- **Email**: yss20042003@gmail.com
- **GitHub**: https://github.com/your-username
- **LinkedIn**: https://linkedin.com/in/your-profile

## Directory Structure
```
/gst-assistant
│── /src
│   ├── /components
│   ├── /pages
│   ├── /services
│   ├── /styles
│── /public
│── /config
│── package.json
│── README.md
```

This README provides a structured and professional presentation of the GST Assistant project.

