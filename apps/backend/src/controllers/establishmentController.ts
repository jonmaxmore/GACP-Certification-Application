import { Request, Response, NextFunction } from 'express';
import establishmentService from '../services/establishmentService';

class EstablishmentController {

    // POST /api/v2/establishments
    create = async (req: Request | any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const establishment = await establishmentService.create(userId, req.body);

            res.status(201).json({
                success: true,
                message: 'สร้างสถานประกอบการสำเร็จ',
                item: establishment,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/v2/establishments
    getMyEstablishments = async (req: Request | any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const establishments = await establishmentService.getByOwner(userId);

            res.status(200).json({
                success: true,
                items: establishments,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/v2/establishments/:id
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const establishment = await establishmentService.getById(req.params.id);

            res.status(200).json({
                success: true,
                item: establishment,
            });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/v2/establishments/:id
    update = async (req: Request | any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const establishmentId = req.params.id;

            const updatedEstablishment = await establishmentService.update(establishmentId, userId, req.body);

            res.status(200).json({
                success: true,
                message: 'อัปเดตข้อมูลสถานประกอบการสำเร็จ',
                item: updatedEstablishment,
            });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/v2/establishments/:id
    delete = async (req: Request | any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const establishmentId = req.params.id;

            await establishmentService.delete(establishmentId, userId);

            res.status(200).json({
                success: true,
                message: 'ลบสถานประกอบการสำเร็จ',
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new EstablishmentController();
