import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';

class UserController {

    // GET /api/v2/users - ระบบหลังบ้าน (Support Admin Dashboard)
    // รองรับการกรองคนขออนุญาตปลูกกัญชา (status=pending) หรือประเภท farmer
    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const role = req.query.role as string;
            const verificationStatus = req.query.verificationStatus as string;
            const farmerType = req.query.farmerType as string;
            const search = req.query.search as string;

            const result = await userService.getAllUsers({
                page, limit, role, verificationStatus, farmerType, search
            });

            // Standard V2 Response
            res.status(200).json({
                success: true,
                items: result.users,
                meta: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/v2/users/me - ระบบสมาชิก (Profile)
    getMe = async (req: Request | any, res: Response, next: NextFunction) => {
        try {
            // req.user มาจาก Auth Middleware
            const user = await userService.getUserById(req.user.id);

            res.status(200).json({
                success: true,
                item: user
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/v2/users/:id - ระบบหลังบ้าน (Detail View)
    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await userService.getUserById(req.params.id);
            res.status(200).json({
                success: true,
                item: user
            });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/v2/users/me - ระบบสมาชิก (Update Profile)
    updateProfile = async (req: Request | any, res: Response, next: NextFunction) => {
        try {
            const user = await userService.updateProfile(req.user.id, req.body);
            res.status(200).json({
                success: true,
                message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
                item: user
            });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/v2/users/:id/status - ระบบกัญชา (Approve/Reject Application)
    // Endpoint นี้สำหรับ Admin เท่านั้น
    adminUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status, adminNote } = req.body;

            if (!['verified', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Status must be verified or rejected' });
            }

            const user = await userService.approveOrRejectUser(req.params.id, status, adminNote);

            res.status(200).json({
                success: true,
                message: `ปรับสถานะผู้ใช้งานเป็น ${status} เรียบร้อยแล้ว`,
                item: user
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new UserController();
