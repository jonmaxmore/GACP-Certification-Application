import User from '../../models/User';

interface UserFilter {
    page: number;
    limit: number;
    role?: string;
    verificationStatus?: string;
    farmerType?: string;
    search?: string;
}

class UserService {

    // 1. ดึงรายชื่อสมาชิกพร้อม Filter ขั้นสูง (รองรับ Corporate/GACP)
    async getAllUsers(filter: UserFilter) {
        const { page, limit, role, verificationStatus, farmerType, search } = filter;
        const skip = (page - 1) * limit;

        // Build Query
        const query: any = {};

        if (role) query.role = role;
        if (verificationStatus) query.verificationStatus = verificationStatus;

        // [NEW] กรองนิติบุคคล (corporate) หรือ บุคคลธรรมดา (individual)
        if (farmerType) query.farmerType = farmerType;

        if (search) {
            query.$or = [
                // ค้นหาจากชื่อ-นามสกุล
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                // ค้นหาจาก email
                { email: { $regex: search, $options: 'i' } },
                // ค้นหาจากเบอร์โทร
                { phone: { $regex: search, $options: 'i' } },
                // [NEW] ค้นหาจากเลขใบอนุญาตปลูก (ถ้ามี)
                { licenseNumber: { $regex: search, $options: 'i' } },
                // [NEW] ค้นหาจากเลขทะเบียนนิติบุคคล (Corporate ID)
                { corporateId: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute
        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // 2. Get User By ID
    async getUserById(id: string) {
        const user = await User.findById(id).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    // 3. Update Profile
    async updateProfile(id: string, data: any) {
        // Prevent updating sensitive fields
        delete data.password;
        delete data.role;
        delete data.email;

        const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    // 4. Approve/Reject User
    async approveOrRejectUser(id: string, status: string, adminNote?: string) {
        const updateData: any = { verificationStatus: status };

        if (adminNote) {
            updateData.notes = adminNote;
        }

        // Sync with main status
        if (status === 'verified') {
            updateData.isActive = true;
            updateData.status = 'active';
        } else if (status === 'rejected') {
            updateData.isActive = false;
            updateData.status = 'inactive';
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

export default new UserService();
