import { Dictionary } from "../types";

export const en: Dictionary = {
    common: {
        loading: "Loading...",
        error: "Error occurred",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        back: "Back",
        confirm: "Confirm",
        success: "Success",
        viewAll: "View All",
        startNow: "Start Now"
    },
    dashboard: {
        greeting: {
            morning: "Good Morning",
            afternoon: "Good Afternoon",
            evening: "Good Evening",
        },
        verification: {
            warningTitle: "Identity Verification Required",
            warningMsg: "You have not verified your identity or it is under review.\nPlease complete the verification to start applying for certification.",
            button: "Verify Identity Now",
            statusPending: "Status: Verification Pending",
        },
        hero: {
            newApp: "New Application",
            verifyToStart: "Verify to Start",
        },
        stats: {
            total: "Total Applications",
            active: "Processing",
            pendingAudit: "Pending Audit",
            certified: "Certificates",
        },
        status: {
            DRAFT: "Draft",
            SUBMITTED: "Submitted",
            PAYMENT_1_PENDING: "Payment 1 Pending",
            PAID_PHASE_1: "Paid Phase 1",
            PAYMENT_2_PENDING: "Payment 2 Pending",
            PAID_PHASE_2: "Paid Phase 2",
            REVISION_REQUIRED: "Revision Required",
            DOCUMENT_APPROVED: "Document Approved",
            PENDING_AUDIT: "Audit Pending",
            APPROVED: "Certified",
        },
        sections: {
            recent: "Recent Activities",
            certificates: "My Certificates",
            quickMenu: "Quick Menu",
            noCert: "No Certificates Yet",
            noApp: "No Applications Yet",
            startApp: "Start your first application now",
        },
        menus: {
            manual: "User Manual",
            manualDesc: "For Farmers",
            report: "Report Issue",
            reportDesc: "Contact Support",
        },
        alerts: {
            auditFeeTitle: "Payment Required: Audit Fee",
            auditFeeDesc: "Your application documents have been approved. Please pay the audit fee to schedule an inspector.",
            auditFeeButton: "Pay Now",
            auditApptTitle: "Audit Appointment Scheduled",
            date: "Date",
            time: "Time",
            modeOnline: "Mode: Online (Google Meet)",
            modeOnsite: "Mode: Onsite",
            location: "Location",
            meetButton: "Join Google Meet",
            paymentTitle: "Payment Alert",
            paymentDesc: "Please complete your payment to proceed with the application",
            paymentButton: "Pay Now",
        },
        appCard: {
            title: "GACP Certification Application",
            lastInfo: "GACP Certificate Request",
            continue: "Continue",
            lastUpdate: "Last Update"
        },
        empty: {
            title: "No Applications Found",
            desc: "Start your GACP certification journey to elevate your farm standards"
        },
        buttons: {
            download: "Download"
        }
    },
    sidebar: {
        dashboard: "Dashboard",
        applications: "Applications",
        establishments: "Establishments",
        planting: "Planting Cycles",
        certificates: "Certificates",
        tracking: "Tracking",
        payments: "Payments",
        profile: "Profile",
        settings: "Settings",
        logout: "Log out"
    },
    settings: {
        title: "Settings",
        general: "General",
        language: "Language",
        security: "Security",
        notifications: "Notifications",
        theme: "Theme",
        darkMode: "Dark Mode",
        password: "Password",
        changePassword: "Change Password"
    },
    auth: {
        loginTitle: "Login",
        registerTitle: "Register"
    },
    wizard: {
        steps: {
            general: "Applicant Info",
            personnel: "Personnel",
            facilities: "Facilities",
            farm: "Farm Info",
            planting: "Planting",
            production: "Production",
            lots: "Lots",
            review: "Review"
        },
        plantSelection: {
            title: "Select Medicinal Plant",
            subtitle: "Start your GACP certification application",
            sections: {
                plant: "Select Plant Type",
                plantDesc: "Please select the plant for GACP certification",
                serviceType: "Application Type",
                serviceTypeDesc: "Select your application type",
                purpose: "Purpose",
                purposeDesc: "Select production purpose",
                method: "Cultivation Method",
                methodDesc: "Select cultivation method"
            },
            serviceTypes: {
                new: { label: "New Application", desc: "For first-time applicants or expired certificates" },
                renewal: { label: "Renewal", desc: "For existing certificates (apply within 90 days before expiry)" },
                modify: { label: "Amendment", desc: "For modifying existing certificate details" }
            },
            note: "One application = One cultivation method. Please submit separate applications for multiple methods."
        },
        general: {
            title: "Applicant Information",
            subtitle: "Please provide complete applicant details",
            applicantName: "Applicant Name",
            firstName: "First Name",
            lastName: "Last Name",
            personalId: "National ID / Passport",
            address: "Registered Address",
            contact: "Contact Information",
            email: "Email",
            phone: "Phone Number"
        },
        farm: {
            title: "Farm Information",
            subtitle: "Location details, environment, and security as per GACP standards",
            sections: {
                general: "General Farm Information",
                environment: "Site Environment (GACP)",
                sanitation: "Sanitation & Facilities",
                water: "Water Sources & Quality",
                gps: "GPS Coordinates",
                security: "Security System",
                documents: "Site Documents"
            },
            fields: {
                farmName: "Farm Name / Establishment",
                address: "Farm Address",
                province: "Province",
                postalCode: "Postal Code",
                totalArea: "Total Area",
                unit: "Unit",
                ownership: "Land Ownership",
                ownershipOptions: {
                    owner: "Owner",
                    rented: "Rented",
                    consent: "Consent Used"
                }
            },
            borders: {
                title: "Borders",
                north: "North",
                south: "South",
                east: "East",
                west: "West"
            },
            soil: {
                title: "Soil Information",
                type: "Soil Type",
                ph: "Soil pH (Optional)",
                history: "Land Use History"
            },
            water: {
                source: "Water Source",
                quality: "Water Quality",
                status: {
                    pass: "Pass",
                    fail: "Fail",
                    pending: "Pending"
                }
            }
        },
        plots: {
            title: "Plot Zoning",
            subtitle: "Define zones and sub-plots for QR Code generation and traceability",
            summary: {
                title: "Area Summary",
                totalArea: "Total Area",
                allocatedArea: "Allocated",
                remainingArea: "Remaining",
                qrCount: "QR Codes",
                unit: "Unit",
                noTotalArea: "No total area found: Please provide details in Step 3 (Farm Info) first"
            },
            list: {
                title: "Plot List",
                empty: {
                    title: "No plots added yet",
                    subtitle: "Click here or the button below to add a new plot"
                },
                badges: {
                    soil: "Soil",
                    seed: "Seed",
                    ipm: "IPM"
                },
                addTitle: "Add New Plot",
                addSubtitle: "Click to enter plot details",
                addBtn: "Add Plot"
            },
            form: {
                name: "Plot Name",
                namePlaceholder: "e.g., A1, Zone B",
                area: "Area Size",
                areaPlaceholder: "Number",
                unit: "Unit",
                gacpTitle: "Quality Data (GACP)",
                soilType: "Soil Type",
                seedSource: "Seed Source",
                ipmLabel: "Integrated Pest Management (IPM) Plan",
                select: "-- Select --"
            }
        },
        documents: {
            title: "Documents",
            subtitle: "Please upload the required documents below for consideration.",
            aiScan: "AI System is checking",
            downloadForm: "Download Form",
            upload: "Click to Upload",
            dragDrop: "or Drag & Drop files here",
            status: {
                mandatory: "Required",
                uploaded: "Uploaded",
                missing: "Missing",
                complete: "Complete",
                missingCount: "missing",
            },
            headers: {
                todo: "To Do",
                done: "Uploaded",
            },
            extra: {
                video: "Farm Introduction Video",
                hint: "Introduce yourself and show the farm briefly (max 5 minutes)",
            },
            docNames: {
                APP_FORM: "Application Form",
                house_reg: "House Registration",
                land_deed: "Land Deed/Usage Rights",
                land_consent: "Land Usage Consent",
                site_map: "Farm Site Map",
                building_plan: "Building/Facility Plan",
                photos_exterior: "Exterior Photos",
                photos_interior: "Interior Photos",
                production_plan: "Production Plan",
                security_measures: "Security Measures",
                medical_cert: "Medical Certificate",
                elearning_cert: "e-Learning Certificate",
                strain_cert: "Strain Source Certificate (If any)",
                sop_thai: "Standard Operating Procedures (SOPs)",
                training_records: "Staff Training Records",
                staff_test: "Staff Knowledge Test Results",
                soil_water_test: "Soil/Water Analysis Results",
                flower_test: "Flower Analysis Results (If any)",
                input_report: "Agricultural Input Records",
                cp_ccp_plan: "Critical Control Points Plan (CP/CCP)",
                calibration_cert: "Equipment Calibration Certificate",
            },
            messages: {
                analyzing: "Analyzing document... Please wait",
                valid: "Document passed initial check",
                invalid: "Document not found or invalid",
            },
        },
        preview: {
            title: "Review",
            subtitle: "Please review the information before submitting your application.",
            print: "Print/Save PDF",
            headers: {
                applicant: "Applicant Information",
                farm: "Production Site Information",
                plots: "Plots",
                production: "Production Management",
                documents: "Attached Documents",
            },
            labels: {
                name: "Full Name",
                id: "ID Card / Business ID",
                phone: "Phone Number",
                email: "Email",
                address: "Address",
                hygiene: "Personal Hygiene",
                farmName: "Farm/Site Name",
                location: "Location",
                totalArea: "Total Area",
                ownership: "Ownership",
                water: "Water Sources",
                gps: "GPS Coordinates",
                sanitation: "Sanitation",
                totalPlants: "Total Plants",
                plantingDate: "Estimated Planting Date",
                docCount: "Document Count",
            },
        },
        quote: {
            title: "Quotation",
            subtitle: "Please review and accept the quotation to proceed.",
            milestone1Title: "Milestone 1: Document Review Fee",
            milestone1Desc: "Payment is divided into 2 milestones. The first milestone is for experts to review your application documents.\nOnce paid, the verification process will begin within 5-7 business days.",
            dtam: {
                title: "GACP Fee",
                subtitle: "DTAM",
                feeLabel: "Document Check (Phase 1)",
            },
            platform: {
                title: "Platform Fee",
                subtitle: "GACP Platform Co., Ltd.",
                feeLabel: "Service Fee (10%)",
            },
            buttons: {
                viewDetails: "View Details",
                accept: "Accept Quote",
                accepted: "Accepted",
            },
            summary: {
                totalLabel: "Net Total",
                netTotal: "Total Payment",
            },
        },
        invoice: {
            title: "Payment",
            subtitle: "Please make the payment according to the invoice to proceed to the next step.",
            phase1Title: "Payment (Fee)",
            phase2Title: "Audit Fee Payment",
            paper: {
                orgName: "Department of Thai Traditional and Alternative Medicine",
                orgAddress: "88/23 Moo 4, Tiwanon Road, Mueang District, Nonthaburi 11000",
                invoiceTitle: "INVOICE",
                customer: "Customer Name",
                address: "Address",
                date: "Date:",
                dueDate: "Due Date:",
                no: "No:",
                note: "This document is computer generated.",
                copyright: "© GACP Platform Co., Ltd. All rights reserved.",
            },
            table: {
                no: "No.",
                description: "Description",
                amount: "Amount (THB)",
                total: "Net Amount",
            },
            items: {
                standardFee: "GACP Certification Standard Fee",
                docCheck: "Document Check Fee",
                auditFee: "Audit Fee",
                travelFee: "Travel Expense (Standard)",
            },
            payment: {
                qrTitle: "Pay via QR Code",
                qrSubtitle: "Supports all banks (Mobile Banking)",
            },
            modal: {
                scanQr: "Scan QR Code to Pay",
                simulate: "Simulate Success",
                cancel: "Cancel",
            },
        },
        submit: {
            title: "Confirm Submission",
            subtitle: "Verify accuracy and confirm to proceed.",
            button: "Confirm Submission",
            submitting: "Submitting...",
            infoCard: {
                title: "Applicant Info",
                applicantName: "Applicant Name",
                farmName: "Farm Name",
                location: "Location",
                plant: "Plant",
            },
            declarations: {
                title: "Confirmation and Declarations",
                dataCorrect: "I confirm that all information is correct and true. If found false, I consent to immediate cancellation.",
                termsAccepted: "I accept the Terms and Conditions of GACP Certification by DTAM.",
                paymentUnderstood: "I understand that the Audit Fee must be paid after receiving the Invoice.",
            },
        },
        success: {
            title: "Submission Successful!",
            message: "Thank you for applying for GACP Certification.\nOur team has received your information.",
            caseId: "Application Case ID",
            saveNote: "Please save this ID to track your status.",
            researchInfo: {
                title: "Research Info:",
                project: "Project: GACP Standard Development for Thai Herbs",
                researcher: "Researcher: DTAM",
                contact: "Contact: support@gacp-research.com",
            },
            buttons: {
                home: "Back to Home",
                print: "Print Receipt/Application",
            },
        },
        navigation: {
            next: "Next",
            back: "Back",
            saveDraft: "Save Draft"
        }
    }
};
