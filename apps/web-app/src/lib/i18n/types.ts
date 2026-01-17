export type Dictionary = {
    common: {
        loading: string;
        error: string;
        save: string;
        cancel: string;
        edit: string;
        delete: string;
        back: string;
        confirm: string;
        success: string;
        viewAll: string;
        startNow: string;
    };
    dashboard: {
        greeting: {
            morning: string;
            afternoon: string;
            evening: string;
        };
        verification: {
            warningTitle: string;
            warningMsg: string;
            button: string;
            statusPending: string;
        };
        hero: {
            newApp: string;
            verifyToStart: string;
        };
        stats: {
            total: string;
            active: string;
            pendingAudit: string;
            certified: string;
        };
        status: {
            [key: string]: string;
        };
        sections: {
            recent: string;
            certificates: string;
            quickMenu: string;
            noCert: string;
            noApp: string;
            startApp: string;
        };
        menus: {
            manual: string;
            manualDesc: string;
            report: string;
            reportDesc: string;
        };
        alerts: {
            auditFeeTitle: string;
            auditFeeDesc: string;
            auditFeeButton: string;
            auditApptTitle: string;
            date: string;
            time: string;
            modeOnline: string;
            modeOnsite: string;
            location: string;
            meetButton: string;
            paymentTitle: string;
            paymentDesc: string;
            paymentButton: string;
        };
        appCard: {
            title: string;
            lastInfo: string;
            continue: string;
            lastUpdate: string;
        };
        empty: {
            title: string;
            desc: string;
        };
        buttons: {
            download: string;
        };
    };
    sidebar: {
        dashboard: string;
        applications: string;
        establishments: string;
        planting: string;
        certificates: string;
        tracking: string;
        payments: string;
        profile: string;
        settings: string;
        logout: string;
    };
    settings: {
        title: string;
        general: string;
        language: string;
        security: string;
        notifications: string;
        theme: string;
        darkMode: string;
        password: string;
        changePassword: string;
    };
    auth: {
        loginTitle: string;
        registerTitle: string;
    };
    wizard: {
        steps: {
            general: string;
            personnel: string;
            facilities: string;
            farm: string;
            planting: string;
            production: string;
            lots: string;
            review: string;
        };
        plantSelection: {
            title: string;
            subtitle: string;
            sections: {
                plant: string;
                plantDesc: string;
                serviceType: string;
                serviceTypeDesc: string;
                purpose: string;
                purposeDesc: string;
                method: string;
                methodDesc: string;
            };
            serviceTypes: {
                new: { label: string; desc: string };
                renewal: { label: string; desc: string };
                modify: { label: string; desc: string };
            };
            note: string;
        };
        general: {
            title: string;
            subtitle: string;
            infoHeader: string;
            typeHeader: string;
            applicantName: string;
            firstName: string;
            lastName: string;
            personalId: string;
            address: string;
            contact: string;
            email: string;
            phone: string;
        };
        farm: {
            title: string;
            subtitle: string;
            sections: {
                general: string;
                environment: string;
                sanitation: string;
                water: string;
                gps: string;
                security: string;
                documents: string;
            };
            fields: {
                farmName: string;
                address: string;
                province: string;
                postalCode: string;
                totalArea: string;
                unit: string;
                ownership: string;
                ownershipOptions: {
                    owner: string;
                    rented: string;
                    consent: string;
                };
            };
            borders: {
                title: string;
                north: string;
                south: string;
                east: string;
                west: string;
            };
            soil: {
                title: string;
                type: string;
                ph: string;
                history: string;
            };
            water: {
                source: string;
                quality: string;
                status: {
                    pass: string;
                    fail: string;
                    pending: string;
                };
            };
        };
        plots: {
            title: string;
            subtitle: string;
            summary: {
                title: string;
                totalArea: string;
                allocatedArea: string;
                remainingArea: string;
                qrCount: string;
                unit: string;
                noTotalArea: string;
            };
            list: {
                title: string;
                empty: {
                    title: string;
                    subtitle: string;
                };
                badges: {
                    soil: string;
                    seed: string;
                    ipm: string;
                };
                addTitle: string;
                addSubtitle: string;
                addBtn: string;
            };
            form: {
                name: string;
                namePlaceholder: string;
                area: string;
                areaPlaceholder: string;
                unit: string;
                gacpTitle: string;
                soilType: string;
                seedSource: string;
                ipmLabel: string;
                select: string;
            };
        };
        documents: {
            title: string;
            subtitle: string;
            aiScan: string;
            downloadForm: string;
            upload: string;
            dragDrop: string;
            status: {
                mandatory: string;
                uploaded: string;
                missing: string;
                complete: string;
                missingCount: string;
            };
            headers: {
                todo: string;
                done: string;
            };
            extra: {
                video: string;
                hint: string;
            };
            docNames: {
                [key: string]: string;
            };
            messages: {
                analyzing: string;
                valid: string;
                invalid: string;
            };
        };
        preview: {
            title: string;
            subtitle: string;
            print: string;
            headers: {
                applicant: string;
                farm: string;
                plots: string;
                production: string;
                documents: string;
            };
            labels: {
                name: string;
                id: string;
                phone: string;
                email: string;
                address: string;
                hygiene: string;
                farmName: string;
                location: string;
                totalArea: string;
                ownership: string;
                water: string;
                gps: string;
                sanitation: string;
                totalPlants: string;
                plantingDate: string;
                docCount: string;
            };
        };
        quote: {
            title: string;
            subtitle: string;
            milestone1Title: string;
            milestone1Desc: string;
            dtam: {
                title: string;
                subtitle: string;
                feeLabel: string;
            };
            platform: {
                title: string;
                subtitle: string;
                feeLabel: string;
            };
            buttons: {
                viewDetails: string;
                accept: string;
                accepted: string;
            };
            summary: {
                totalLabel: string;
                netTotal: string;
            };
        };
        invoice: {
            title: string;
            subtitle: string;
            phase1Title: string;
            phase2Title: string;
            paper: {
                orgName: string;
                orgAddress: string;
                invoiceTitle: string;
                customer: string;
                address: string;
                date: string;
                dueDate: string;
                no: string;
                note: string;
                copyright: string;
            };
            table: {
                no: string;
                description: string;
                amount: string;
                total: string;
            };
            payment: {
                qrTitle: string;
                qrSubtitle: string;
            };
            modal: {
                scanQr: string;
                simulate: string;
                cancel: string;
            };
            items: {
                standardFee: string;
                docCheck: string;
                auditFee: string;
                travelFee: string;
            };
        };
        submit: {
            title: string;
            subtitle: string;
            button: string;
            submitting: string;
            infoCard: {
                title: string;
                applicantName: string;
                farmName: string;
                location: string;
                plant: string;
            };
            declarations: {
                title: string;
                dataCorrect: string;
                termsAccepted: string;
                paymentUnderstood: string;
            };
        };
        success: {
            title: string;
            message: string;
            caseId: string;
            saveNote: string;
            researchInfo: {
                title: string;
                project: string;
                researcher: string;
                contact: string;
            };
            buttons: {
                home: string;
                print: string;
            };
        };
        navigation: {
            next: string;
            back: string;
            saveDraft: string;
        };
    };
};
