import { Dictionary } from "../types";

export const th: Dictionary = {
    common: {
        loading: "กำลังโหลด...",
        error: "เกิดข้อผิดพลาด",
        save: "บันทึก",
        cancel: "ยกเลิก",
        edit: "แก้ไข",
        delete: "ลบ",
        back: "กลับ",
        confirm: "ยืนยัน",
        success: "สำเร็จ",
        viewAll: "ดูทั้งหมด",
        startNow: "เริ่มต้นตอนนี้"
    },
    dashboard: {
        greeting: {
            morning: "สวัสดีตอนเช้า",
            afternoon: "สวัสดีตอนบ่าย",
            evening: "สวัสดีตอนเย็น",
        },
        verification: {
            warningTitle: "กรุณายืนยันตัวตน (Identity Verification Required)",
            warningMsg: "ท่านยังไม่ได้ยืนยันตัวตน หรืออยู่ระหว่างการตรวจสอบ\nกรุณาดำเนินการให้เสร็จสิ้นเพื่อเริ่มยื่นคำขอใบรับรอง",
            button: "ยืนยันตัวตนทันที",
            statusPending: "สถานะ: รอการยืนยันตัวตน",
        },
        hero: {
            newApp: "ยื่นคำขอใหม่",
            verifyToStart: "ยืนยันตัวตนเพื่อเริ่มใช้งาน",
        },
        stats: {
            total: "คำขอทั้งหมด",
            active: "กำลังดำเนินการ",
            pendingAudit: "รอตรวจแปลง",
            certified: "ใบรับรอง",
        },
        status: {
            DRAFT: "ร่างคำขอ",
            SUBMITTED: "รอตรวจเอกสาร",
            PAYMENT_1_PENDING: "รอชำระค่าธรรมเนียม",
            PAID_PHASE_1: "ชำระเงินแล้ว (งวด 1)",
            PAYMENT_2_PENDING: "รอชำระค่าตรวจประเมิน",
            PAID_PHASE_2: "ชำระเงินแล้ว (งวด 2)",
            REVISION_REQUIRED: "ต้องแก้ไขเอกสาร",
            DOCUMENT_APPROVED: "เอกสารผ่านการตรวจสอบ",
            PENDING_AUDIT: "รอตรวจประเมิน",
            APPROVED: "ได้รับการรับรอง",
        },
        sections: {
            recent: "รายการล่าสุด",
            certificates: "ใบรับรองของฉัน (My Certificates)",
            quickMenu: "เมนูด่วน",
            noCert: "ยังไม่มีใบรับรอง",
            noApp: "ยังไม่มีคำขอใบรับรอง",
            startApp: "เริ่มต้นยื่นคำขอแรกของคุณได้เลย",
        },
        menus: {
            manual: "คู่มือการใช้งาน",
            manualDesc: "สำหรับเกษตรกร",
            report: "แจ้งปัญหา",
            reportDesc: "ติดต่อเจ้าหน้าที่",
        },
        alerts: {
            auditFeeTitle: "แจ้งชำระค่าธรรมเนียมการตรวจประเมิน",
            auditFeeDesc: "คำขอของท่านผ่านการตรวจสอบเอกสารแล้ว กรุณาชำระค่าธรรมเนียมเพื่อดำเนินการนัดหมายผู้ตรวจประเมิน",
            auditFeeButton: "ชำระเงินทันที",
            auditApptTitle: "มีนัดหมายตรวจประเมิน",
            date: "วันที่",
            time: "เวลา",
            modeOnline: "รูปแบบ: ตรวจออนไลน์ (Google Meet)",
            modeOnsite: "รูปแบบ: ลงพื้นที่ (Onsite)",
            location: "สถานที่",
            meetButton: "เข้าห้อง Google Meet",
            paymentTitle: "แจ้งเตือนการชำระเงิน",
            paymentDesc: "กรุณาดำเนินการชำระค่าธรรมเนียมเพื่อดำเนินการต่อ",
            paymentButton: "ชำระเงิน",
        },
        appCard: {
            title: "คำขอความจำนงรับรอง GACP",
            lastInfo: "คำขอใบรับรอง GACP",
            continue: "ดำเนินการต่อ",
            lastUpdate: "อัปเดตล่าสุด"
        },
        empty: {
            title: "ยังไม่มีรายการคำขอ",
            desc: "เริ่มต้นยื่นคำขอรับรองมาตรฐาน GACP เพื่อยกระดับฟาร์มของคุณ"
        },
        buttons: {
            download: "ดาวน์โหลดเอกสาร"
        }
    },
    sidebar: {
        dashboard: "หน้าหลัก",
        applications: "รายการคำขอ",
        establishments: "แปลงปลูก",
        planting: "รอบการปลูก",
        certificates: "ใบรับรอง",
        tracking: "ติดตามสถานะ",
        payments: "ประวัติการชำระเงิน",
        profile: "ข้อมูลส่วนตัว",
        settings: "ตั้งค่าระบบ",
        logout: "ออกจากระบบ"
    },
    settings: {
        title: "ตั้งค่าระบบ",
        general: "ทั่วไป",
        language: "ภาษา",
        security: "ความปลอดภัย",
        notifications: "การแจ้งเตือน",
        theme: "ธีม",
        darkMode: "โหมดมืด",
        password: "รหัสผ่าน",
        changePassword: "เปลี่ยนรหัสผ่าน"
    },
    auth: {
        loginTitle: "เข้าสู่ระบบ",
        registerTitle: "ลงทะเบียน"
    },
    wizard: {
        steps: {
            general: "ข้อมูลผู้ยื่น",
            personnel: "การจัดการด้านบุคลากร",
            facilities: "สิ่งอำนวยความสะดวก",
            farm: "ข้อมูลฟาร์ม",
            planting: "การเพาะปลูก",
            production: "ผลผลิต",
            lots: "ล็อตการผลิต",
            review: "ตรวจสอบข้อมูล"
        },
        plantSelection: {
            title: "เลือกพืชสมุนไพร",
            subtitle: "เริ่มต้นการยื่นคำขอรับรองมาตรฐาน GACP",
            sections: {
                plant: "เลือกชนิดพืชสมุนไพร",
                plantDesc: "กรุณาเลือกพืชที่ต้องการขอรับรอง GACP",
                serviceType: "ประเภทคำขอ",
                serviceTypeDesc: "เลือกประเภทการยื่นคำขอของท่าน",
                purpose: "วัตถุประสงค์",
                purposeDesc: "เลือกวัตถุประสงค์การผลิต",
                method: "รูปแบบการปลูก",
                methodDesc: "เลือกวิธีการปลูกสมุนไพร"
            },
            serviceTypes: {
                new: { label: "ขอใหม่", desc: "สำหรับผู้ที่ยังไม่เคยมีใบรับรอง GACP หรือใบรับรองเดิมหมดอายุเกินกำหนดต่ออายุ" },
                renewal: { label: "ต่ออายุ", desc: "สำหรับใบรับรองเดิมที่ใกล้หมดอายุ สามารถยื่นล่วงหน้าได้ 90 วัน" },
                modify: { label: "เปลี่ยนแปลงรายการ", desc: "แก้ไขข้อมูลในใบรับรองเดิม เช่น เปลี่ยนแปลงผู้ดำเนินกิจการ หรือพื้นที่ปลูก" }
            },
            note: "หนึ่งใบคำขอ = หนึ่งรูปแบบการเพาะปลูก หากมีหลายรูปแบบกรุณายื่นแยกคำขอ"
        },
        general: {
            title: "ข้อมูลผู้ยื่นคำขอ",
            subtitle: "กรุณาระบุข้อมูลของผู้ยื่นคำขอให้ครบถ้วน",
            applicantName: "ชื่อ-นามสกุล ผู้ยื่นคำขอ",
            firstName: "ชื่อ",
            lastName: "นามสกุล",
            personalId: "เลขบัตรประจำตัวประชาชน",
            address: "ที่อยู่ตามบัตรประชาชน",
            contact: "ข้อมูลการติดต่อ",
            email: "อีเมล",
            phone: "เบอร์โทรศัพท์"
        },
        farm: {
            title: "ข้อมูลฟาร์ม",
            subtitle: "รายละเอียดที่ตั้ง สภาพแวดล้อม และระบบความปลอดภัยตามมาตรฐาน GACP",
            sections: {
                general: "ข้อมูลทั่วไปของฟาร์ม",
                environment: "สภาพแวดล้อมพื้นที่ (GACP)",
                sanitation: "สุขอนามัยและสิ่งอำนวยความสะดวก",
                water: "แหล่งน้ำและคุณภาพน้ำ",
                gps: "พิกัดฟาร์ม (GPS)",
                security: "ระบบรักษาความปลอดภัย",
                documents: "เอกสารประกอบพื้นที่"
            },
            fields: {
                farmName: "ชื่อฟาร์ม/สถานประกอบการ",
                address: "ที่อยู่ฟาร์ม",
                province: "จังหวัด",
                postalCode: "รหัสไปรษณีย์",
                totalArea: "พื้นที่รวม",
                unit: "หน่วย",
                ownership: "กรรมสิทธิ์ที่ดิน",
                ownershipOptions: {
                    owner: "เป็นเจ้าของ",
                    rented: "เช่า",
                    consent: "ได้รับความยินยอม"
                }
            },
            borders: {
                title: "อาณาเขตติดต่อ",
                north: "ทิศเหนือ",
                south: "ทิศใต้",
                east: "ทิศตะวันออก",
                west: "ทิศตะวันตก"
            },
            soil: {
                title: "ข้อมูลดินปลูก (Soil Information)",
                type: "ลักษณะดิน (Soil Type)",
                ph: "ค่า pH ดิน (ถ้าทราบ)",
                history: "ประวัติการใช้ที่ดินย้อนหลัง (Land Use History)"
            },
            water: {
                source: "แหล่งน้ำที่ใช้",
                quality: "คุณภาพน้ำ",
                status: {
                    pass: "ผ่านเกณฑ์",
                    fail: "ไม่ผ่านเกณฑ์",
                    pending: "รอผลตรวจ"
                }
            }
        },
        plots: {
            title: "การแบ่งแปลงปลูก (Zoning)",
            subtitle: "กำหนดโซนและแปลงย่อยสำหรับสร้าง QR Code และติดตามผลผลิต",
            summary: {
                title: "สรุปพื้นที่ทั้งหมด",
                totalArea: "พื้นที่ทั้งหมด",
                allocatedArea: "แบ่งแล้ว",
                remainingArea: "คงเหลือ",
                qrCount: "QR Code",
                unit: "หน่วย",
                noTotalArea: "ไม่พบข้อมูลพื้นที่รวม: กรุณากรอกข้อมูลในขั้นตอนที่ 3 (ข้อมูลฟาร์ม) ก่อน"
            },
            list: {
                title: "รายการแปลงปลูก",
                empty: {
                    title: "ยังไม่มีแปลงปลูก",
                    subtitle: "กดที่นี่ หรือปุ่มด้านล่างเพื่อเพิ่มแปลงใหม่"
                },
                badges: {
                    soil: "ดิน",
                    seed: "เมล็ดพันธุ์",
                    ipm: "IPM"
                },
                addTitle: "เพิ่มแปลงใหม่",
                addSubtitle: "คลิกเพื่อกรอกรายละเอียดแปลง",
                addBtn: "เพิ่มแปลง"
            },
            form: {
                name: "ชื่อแปลง",
                namePlaceholder: "เช่น A1, โซน B",
                area: "ขนาดพื้นที่",
                areaPlaceholder: "จำนวน",
                unit: "หน่วย",
                gacpTitle: "ข้อมูลคุณภาพ (GACP)",
                soilType: "ประเภทดิน",
                seedSource: "แหล่งเมล็ดพันธุ์",
                ipmLabel: "มีแผนการจัดการศัตรูพืชแบบผสมผสาน (IPM)",
                select: "-- เลือก --"
            }
        },
        documents: {
            title: "การตรวจสอบเอกสาร (Smart Documents)",
            subtitle: "ระบบตรวจสอบความถูกต้องเอกสารด้วย AI เพื่อความรวดเร็วในการพิจารณา",
            aiScan: "AI Smart Scan",
            downloadForm: "ดาวน์โหลดแบบฟอร์ม",
            upload: "คลิกเพื่ออัปโหลด",
            dragDrop: "หรือลากไฟล์มาวางที่นี่",
            status: {
                mandatory: "จำเป็นทั้งหมด",
                uploaded: "อัปโหลดแล้ว",
                missing: "เอกสารครบถ้วนแล้ว",
                complete: "เอกสารครบถ้วนแล้ว",
                missingCount: "ขาดอีก {n} รายการ"
            },
            headers: {
                todo: "เอกสารที่ต้องดำเนินการ",
                done: "เอกสารที่เรียบร้อยแล้ว"
            },
            extra: {
                video: "ข้อมูลเพิ่มเติม (ถ้ามี)",
                hint: "ช่วยให้นักวิชาการตรวจสอบสถานที่ได้รวดเร็วขึ้นผ่านวิดีโอ"
            },
            messages: {
                analyzing: "กำลังวิเคราะห์...",
                valid: "เอกสารผ่านการตรวจสอบเบื้องต้น",
                invalid: "เอกสารไม่ถูกต้องหรือข้อมูลไม่ครบ"
            },
            docNames: {
                APP_FORM: "แบบลงทะเบียนยื่นคำขอ",
                house_reg: "สำเนาทะเบียนบ้าน",
                land_deed: "หนังสือแสดงกรรมสิทธิ์ที่ดิน/โฉนด",
                land_consent: "หนังสือสัญญาเช่า / ยินยอมใช้ที่ดิน",
                site_map: "แผนที่ตั้ง + พิกัด GPS",
                building_plan: "แบบแปลนอาคาร/โรงเรือน",
                photos_exterior: "ภาพถ่ายบริเวณภายนอก",
                photos_interior: "ภาพถ่ายภายในสถานที่ผลิต",
                production_plan: "แผนการผลิตแต่ละรอบ/ปี",
                security_measures: "มาตรการรักษาความปลอดภัย",
                medical_cert: "ใบรับรองแพทย์ (ผู้ปฏิบัติงาน)",
                elearning_cert: "หนังสือรับรอง E-learning GACP",
                strain_cert: "หนังสือรับรองสายพันธุ์",
                sop_thai: "คู่มือ SOP (ฉบับภาษาไทย)",
                training_records: "เอกสารการอบรมพนักงาน",
                staff_test: "แบบทดสอบพนักงาน",
                soil_water_test: "ผลตรวจวัสดุปลูก/ดิน/น้ำ",
                flower_test: "ผลตรวจช่อดอก (CoA)",
                input_report: "รายงานปัจจัยการผลิต",
                cp_ccp_plan: "ตารางแผนควบคุม CP/CCP",
                calibration_cert: "ใบสอบเทียบเครื่องมือ"
            }
        },
        preview: {
            title: "ตรวจสอบข้อมูล (Preview)",
            subtitle: "กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนดำเนินการขอใบเสนอราคา",
            print: "พิมพ์ / บันทึก PDF",
            headers: {
                applicant: "ข้อมูลผู้ขอใบรับรอง",
                farm: "ข้อมูลสถานที่ผลิต (ฟาร์ม)",
                plots: "แปลงปลูก",
                production: "ประมาณการผลผลิต",
                documents: "เอกสารประกอบ"
            },
            labels: {
                name: "ชื่อ-นามสกุล / นิติบุคคล",
                id: "เลขบัตรประชาชน / เลขนิติบุคคล",
                phone: "เบอร์โทรศัพท์",
                email: "อีเมล",
                address: "ที่อยู่",
                hygiene: "สุขอนามัยบุคลากร (GACP)",
                farmName: "ชื่อสถานที่ผลิต",
                location: "ที่ตั้ง (จังหวัด)",
                totalArea: "ขนาดพื้นที่ทั้งหมด",
                ownership: "กรรมสิทธิ์",
                water: "แหล่งน้ำ",
                gps: "พิกัด GPS",
                sanitation: "สุขาภิบาล (Sanitation)",
                totalPlants: "จำนวนต้นรวม",
                plantingDate: "วันที่เริ่มปลูก",
                docCount: "เอกสารแนบ"
            }
        },
        quote: {
            title: "ใบเสนอราคา (Quotation)",
            subtitle: "กรุณาตรวจสอบและยอมรับใบเสนอราคาเพื่อดำเนินการต่อ",
            milestone1Title: "งวดที่ 1: ค่าธรรมเนียมการตรวจสอบเอกสาร",
            milestone1Desc: "การชำระเงินแบ่งเป็น 2 งวด โดยงวดแรกจะเป็นค่าธรรมเนียมสำหรับผู้เชี่ยวชาญในการตรวจสอบเอกสารคำขอของท่าน\nเมื่อชำระแล้วจะเข้าสู่กระบวนการตรวจสอบภายใน 5-7 วันทำการ",
            dtam: {
                title: "ค่าธรรมเนียม GACP",
                subtitle: "กรมการแพทย์แผนไทยฯ",
                feeLabel: "ค่าตรวจเอกสาร (งวด 1)",
            },
            platform: {
                title: "ค่าบริการ Platform",
                subtitle: "บริษัท แกคป์ แพลตฟอร์ม จำกัด",
                feeLabel: "ค่าดำเนินการ (10%)",
            },
            buttons: {
                viewDetails: "ดูรายละเอียด",
                accept: "ยอมรับใบเสนอราคา",
                accepted: "ยอมรับแล้ว",
            },
            summary: {
                totalLabel: "ยอดรวมสุทธิ",
                netTotal: "ยอดชำระรวม",
            },
        },
        invoice: {
            title: "ชำระค่าธรรมเนียม (Payment)",
            subtitle: "โปรดชำระเงินตามใบแจ้งหนี้เพื่อดำเนินการในขั้นตอนถัดไป",
            phase1Title: "ชำระค่าธรรมเนียม (Payment)",
            phase2Title: "ชำระค่าธรรมเนียมการตรวจประเมิน",
            paper: {
                orgName: "กรมการแพทย์แผนไทยและการแพทย์ทางเลือก",
                orgAddress: "88/23 หมู่ 4 ถนนติวานนท์ อำเภอเมือง จังหวัดนนทบุรี 11000",
                invoiceTitle: "ใบวางบิล/แจ้งหนี้ (INVOICE)",
                customer: "ชื่อผู้ขอรับบริการ (Customer)",
                address: "ที่อยู่ (Address)",
                date: "วันที่:",
                dueDate: "วันครบกำหนด:",
                no: "เลขที่:",
                note: "เอกสารนี้จัดทำโดยระบบคอมพิวเตอร์",
                copyright: "© GACP Platform Co., Ltd. สงวนลิขสิทธิ์",
            },
            table: {
                no: "ลำดับ",
                description: "รายการ (Description)",
                amount: "จำนวนเงิน (บาท)",
                total: "ยอดชำระสุทธิ (Net Amount)",
            },
            items: {
                standardFee: "ค่าธรรมเนียมคำขอรับรองมาตรฐาน GACP (Standard Fee)",
                docCheck: "ค่าตรวจเอกสาร (Document Check)",
                auditFee: "ค่าธรรมเนียมการตรวจประเมิน (Audit Fee)",
                travelFee: "ค่าพาหนะ (Standard Travel)",
            },
            payment: {
                qrTitle: "ชำระเงินผ่าน QR Code",
                qrSubtitle: "รองรับ Mobile Banking ทุกธนาคาร",
            },
            modal: {
                scanQr: "สแกน QR Code เพื่อชำระเงิน",
                simulate: "จำลองการชำระเงินสำเร็จ",
                cancel: "ยกเลิกทำรายการ",
            },
        },
        submit: {
            title: "ยืนยันการส่งคำขอ",
            subtitle: "ตรวจสอบความถูกต้องและยืนยันเพื่อดำเนินการต่อ",
            button: "ยืนยันการส่งคำขอ",
            submitting: "กำลังส่งข้อมูล...",
            infoCard: {
                title: "ข้อมูลผู้ยื่นคำขอ",
                applicantName: "ชื่อผู้ขอรับรอง",
                farmName: "ชื่อฟาร์ม",
                location: "ที่ตั้งฟาร์ม",
                plant: "พืชที่ขอรับรอง"
            },
            declarations: {
                title: "ยืนยันความถูกต้องและยอมรับเงื่อนไข",
                dataCorrect: "ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดถูกต้องและเป็นความจริงทุกประการ หากมีการตรวจสอบพบว่าเป็นเท็จ ข้าพเจ้ายินยอมให้ยกเลิกคำขอทันที",
                termsAccepted: "ข้าพเจ้ายอมรับเงื่อนไขและข้อกำหนดการรับรองมาตรฐาน GACP ของกรมการแพทย์แผนไทยและการแพทย์ทางเลือก",
                paymentUnderstood: "ข้าพเจ้าเข้าใจว่าจะต้องชำระค่าธรรมเนียมการตรวจประเมินหลังจากได้รับใบแจ้งหนี้ (Invoice)"
            }
        },
        success: {
            title: "ส่งคำขอสำเร็จ!",
            message: "ขอบคุณที่สมัครเข้าร่วมโครงการ GACP\nทีมงานได้รับข้อมูลของท่านเรียบร้อยแล้ว",
            caseId: "เลขที่คำขอ (Application Case ID)",
            saveNote: "โปรดบันทึกรหัสนี้ไว้เพื่อติดตามสถานะ",
            researchInfo: {
                title: "ข้อมูลงานวิจัย (Research Info):",
                project: "โครงการ: พัฒนามาตรฐาน GACP สมุนไพรไทย",
                researcher: "ผู้วิจัย: กรมการแพทย์แผนไทยและการแพทย์ทางเลือก",
                contact: "ติดต่อ: support@gacp-research.com"
            },
            buttons: {
                home: "กลับสู่หน้าหลัก",
                print: "พิมพ์ใบเสร็จ/ใบสมัคร"
            }
        },
        navigation: {
            next: "ถัดไป",
            back: "ย้อนกลับ",
            saveDraft: "บันทึกร่าง"
        }
    }
};
