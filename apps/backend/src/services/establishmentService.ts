import Establishment, { IEstablishment } from '../models/Establishment';
import User from '../../models/User';

class EstablishmentService {

    // 1. Create Establishment
    async create(userId: string, data: any): Promise<IEstablishment> {
        // Validate User
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const establishment = new Establishment({
            ...data,
            owner: userId,
        });

        return await establishment.save();
    }

    // 2. Get All Establishments by Owner
    async getByOwner(userId: string): Promise<IEstablishment[]> {
        return await Establishment.find({ owner: userId, isDeleted: false })
            .sort({ createdAt: -1 });
    }

    // 3. Get Establishment by ID
    async getById(id: string): Promise<IEstablishment | null> {
        const establishment = await Establishment.findOne({ _id: id, isDeleted: false })
            .populate('owner', 'firstName lastName phoneNumber email');

        if (!establishment) {
            throw new Error('Establishment not found');
        }

        return establishment;
    }

    // 4. Update Establishment
    async update(id: string, userId: string, data: any): Promise<IEstablishment | null> {
        // Check ownership
        const establishment = await Establishment.findOne({ _id: id, isDeleted: false });
        if (!establishment) {
            throw new Error('Establishment not found');
        }

        if (establishment.owner.toString() !== userId) {
            throw new Error('Unauthorized: You are not the owner of this establishment');
        }

        // Prevent updating sensitive fields
        delete data.owner;
        delete data.isDeleted;
        delete data.createdAt;
        delete data.updatedAt;

        const updatedEstablishment = await Establishment.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        return updatedEstablishment;
    }

    // 5. Delete Establishment (Soft Delete)
    async delete(id: string, userId: string): Promise<boolean> {
        // Check ownership
        const establishment = await Establishment.findOne({ _id: id, isDeleted: false });
        if (!establishment) {
            throw new Error('Establishment not found');
        }

        if (establishment.owner.toString() !== userId) {
            throw new Error('Unauthorized: You are not the owner of this establishment');
        }

        establishment.isDeleted = true;
        await establishment.save();

        return true;
    }
}

export default new EstablishmentService();
